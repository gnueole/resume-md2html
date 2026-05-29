import json
import urllib.request
import urllib.error
import ssl
import sys
import os
import argparse

# Helper to read .env file without external dependencies
def load_env():
    env_path = os.path.join(os.path.dirname(__file__), ".env")
    if not os.path.exists(env_path):
        print(f"Error: .env file not found at {env_path}")
        print("Please create it with N8N_API_KEY, N8N_WORKFLOW_ID, and N8N_BASE_URL.")
        sys.exit(1)
        
    config = {}
    with open(env_path, "r", encoding="utf-8") as f:
        for line in f:
            line = line.strip()
            if not line or line.startswith("#") or "=" not in line:
                continue
            key, val = line.split("=", 1)
            config[key.strip()] = val.strip()
    return config

env = load_env()
API_KEY = env.get("N8N_API_KEY")
WORKFLOW_ID = env.get("N8N_WORKFLOW_ID")
BASE_URL = env.get("N8N_BASE_URL", "").rstrip("/")

if not API_KEY or not WORKFLOW_ID or not BASE_URL:
    print("Error: Missing credentials in .env file (ensure N8N_API_KEY, N8N_WORKFLOW_ID, and N8N_BASE_URL are set).")
    sys.exit(1)

N8N_URL = f"{BASE_URL}/api/v1/workflows/{WORKFLOW_ID}"

# SSL context bypassing validation
ctx = ssl.create_default_context()
ctx.check_hostname = False
ctx.verify_mode = ssl.CERT_NONE

def fetch_workflow():
    req = urllib.request.Request(
        N8N_URL,
        headers={
            "X-N8N-API-KEY": API_KEY,
            "Accept": "application/json"
        },
        method="GET"
    )
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            if response.status == 200:
                return json.loads(response.read().decode('utf-8'))
    except Exception as e:
        print(f"Error fetching workflow from n8n: {e}")
        sys.exit(1)

def push_workflow(wf):
    # Filter settings keys to avoid API validation errors
    raw_settings = wf.get("settings", {})
    clean_settings = {}
    for k in ["executionOrder", "errorWorkflow"]:
        if k in raw_settings:
            clean_settings[k] = raw_settings[k]

    payload = {
        "name": wf.get("name"),
        "nodes": wf.get("nodes"),
        "connections": wf.get("connections"),
        "settings": clean_settings,
        "staticData": wf.get("staticData")
    }
    
    req = urllib.request.Request(
        N8N_URL,
        data=json.dumps(payload).encode('utf-8'),
        headers={
            "X-N8N-API-KEY": API_KEY,
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        method="PUT"
    )
    
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            if response.status == 200:
                print("SUCCESS: Workflow updated successfully on n8n!")
                return True
            else:
                print(f"FAILED status={response.status}")
                return False
    except urllib.error.HTTPError as e:
        print(f"HTTPError: {e.code} - {e.reason}")
        print(e.read().decode('utf-8'))
        return False
    except Exception as e:
        print(f"Error pushing workflow: {e}")
        return False

def activate_workflow():
    req = urllib.request.Request(
        f"{N8N_URL}/activate",
        data=b"{}",
        headers={
            "X-N8N-API-KEY": API_KEY,
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        method="POST"
    )
    try:
        with urllib.request.urlopen(req, context=ctx) as response:
            if response.status == 200:
                print("SUCCESS: Workflow successfully activated/published on n8n!")
                return True
            else:
                print(f"FAILED to activate workflow, status={response.status}")
                return False
    except Exception as e:
        print(f"Warning: Could not auto-activate workflow via API: {e}")
        return False

def main():
    parser = argparse.ArgumentParser(description="n8n Resume Workflow Sync & Maintenance Toolkit")
    group = parser.add_mutually_exclusive_group(required=True)
    group.add_argument("--backup", action="store_true", help="Download current workflow from n8n and save as local backup JSON")
    group.add_argument("--fix", action="store_true", help="Automatically fix the JS Code node syntax errors (split/join newline bugs) and H3 -> H2 structural splitting")
    group.add_argument("--push", action="store_true", help="Push the local backup JSON workflow back to n8n")
    group.add_argument("--activate", action="store_true", help="Activate/Publish the workflow on n8n")
    
    args = parser.parse_args()
    backup_file = os.path.join(os.path.dirname(__file__), "workflow_backup.json")
    
    if args.backup:
        print("Fetching workflow from n8n...")
        wf = fetch_workflow()
        with open(backup_file, "w", encoding="utf-8") as f:
            json.dump(wf, f, indent=2, ensure_ascii=False)
        print(f"Backup saved successfully to: {backup_file}")
        
    elif args.fix:
        print("Fetching workflow from n8n to apply fixes...")
        wf = fetch_workflow()
        nodes = wf.get("nodes", [])
        updated = False
        
        for node in nodes:
            if "code" in node.get("type", "").lower() and "Génération" in node.get("name", ""):
                print(f"Found target Code node: '{node.get('name')}'")
                js_code = node.get("parameters", {}).get("jsCode", "")
                original_code = js_code
                
                # Replace newline split occurrences safely (only if contains actual newlines)
                s_idx = js_code.find("split('")
                while s_idx != -1:
                    e_idx = js_code.find("')", s_idx)
                    if e_idx != -1:
                        target = js_code[s_idx:e_idx+2]
                        content = js_code[s_idx+7:e_idx]
                        if '\n' in content or '\r' in content:
                            print(f"Replacing newline split: {repr(target)} -> split(String.fromCharCode(10))")
                            js_code = js_code.replace(target, "split(String.fromCharCode(10))")
                    s_idx = js_code.find("split('", s_idx + 1)
                
                # Replace newline join occurrences safely (only if contains actual newlines)
                j_idx = js_code.find("join('")
                while j_idx != -1:
                    e_idx = js_code.find("')", j_idx)
                    if e_idx != -1:
                        target = js_code[j_idx:e_idx+2]
                        content = js_code[j_idx+6:e_idx]
                        if '\n' in content or '\r' in content:
                            print(f"Replacing newline join: {repr(target)} -> join(String.fromCharCode(10))")
                            js_code = js_code.replace(target, "join(String.fromCharCode(10))")
                    j_idx = js_code.find("join('", j_idx + 1)
                
                # 3. Replace H3 layout restructurer with pure Regex H2/H3 splitter
                old_restructurer_start = js_code.find("let finalHtml = compiledHtml;")
                old_restructurer_end = js_code.find("// 6. GENERATE INLINE CSS")
                
                if old_restructurer_start != -1 and old_restructurer_end != -1:
                    print("Updating 2-column layout restructurer to auto-split H2 into Main and H3 into Sidebar...")
                    new_restructurer = """let finalHtml = compiledHtml;
if (config.layoutMode === '2-column') {
    const parts = compiledHtml.split(/(?=<h[23]\\b)/i);
    const headerHtml = parts[0];
    let mainHtml = '';
    let sidebarHtml = '';
    
    for (let i = 1; i < parts.length; i++) {
        const part = parts[i];
        if (part.toLowerCase().startsWith('<h2')) {
            mainHtml += part;
        } else if (part.toLowerCase().startsWith('<h3')) {
            sidebarHtml += part;
        }
    }
    
    finalHtml = `
        <div class="resume-header">
            ${headerHtml}
        </div>
        <div class="resume-columns ${config.sidebarPosition === 'left' ? 'sidebar-left' : ''}">
            <div class="resume-main-col">
                ${mainHtml}
            </div>
            <div class="resume-sidebar-col" style="background-color: ${config.sidebarBg}; color: ${config.sidebarText};">
                ${sidebarHtml}
            </div>
        </div>
    `;
}
"""
                    target_block = js_code[old_restructurer_start:old_restructurer_end]
                    js_code = js_code.replace(target_block, new_restructurer + "\n")
                
                if "margin: 15mm;" in js_code:
                    print("Replacing A4 print margins in template: margin: 15mm; -> margin: 0;")
                    js_code = js_code.replace("margin: 15mm;", "margin: 0;")
                
                old_p_line = "if (trimmed !== '') htmlOutput.push(`<p>${line}</p>`);"
                if old_p_line in js_code:
                    print("Updating Markdown parser to auto-justify inline skills list paragraphs...")
                    new_p_line = """if (trimmed !== '') {
      if (line.includes('•') || line.includes('·')) {
        htmlOutput.push(`<p style="text-align: justify; text-justify: inter-word;">${line}</p>`);
      } else {
        htmlOutput.push(`<p>${line}</p>`);
      }
    }"""
                    js_code = js_code.replace(old_p_line, new_p_line)
                
                if js_code != original_code:
                    node["parameters"]["jsCode"] = js_code
                    updated = True
                
        if updated:
            print("Applying corrections to n8n...")
            if push_workflow(wf):
                activate_workflow()
        else:
            print("No changes or fixes to apply. It might be already fixed.")
            
    elif args.push:
        if not os.path.exists(backup_file):
            print(f"Error: Local backup file not found at {backup_file}")
            sys.exit(1)
        print(f"Reading local workflow file from {backup_file}...")
        with open(backup_file, "r", encoding="utf-8") as f:
            wf = json.load(f)
        print("Pushing workflow to n8n...")
        if push_workflow(wf):
            activate_workflow()
            
    elif args.activate:
        print("Activating workflow on n8n...")
        activate_workflow()

if __name__ == "__main__":
    main()
