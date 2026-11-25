# Agent Deployment Instructions

## For ChatGPT Sites Publication

### Prerequisites
- ChatGPT account with Sites access
- GPT-6 Luna model available

### Deployment Steps

1. **Navigate to ChatGPT Sites**
   - Go to chat.openai.com
   - Access Sites from the sidebar

2. **Create New Site**
   - Click "Create Site"
   - Name: "Housekeep Service Finder — Unofficial Demo"

3. **Configure Agent**
   - Select model: GPT-6 Luna
   - Set visibility: Public
   - Disable sign-in requirement
   - Turn off duplication/remixing

4. **Import System Instructions**
   - Use content from AGENT_INSTRUCTIONS.md
   - Key points:
     - Housekeep is a real UK business
     - This is an unofficial educational prototype
     - Only ask relevant questions progressively
     - Never request payment card details
     - Always link to official Housekeep quote pages

5. **Upload Assets**
   - Upload index.html, styles.css, logic.js, pp.js, mark.svg
   - Set index.html as the entry point

6. **Configure Security**
   - Ensure CSP headers are active
   - Verify no external requests are made
   - Confirm payment card patterns are blocked

7. **Test**
   - Test all 10 verification scenarios
   - Verify emergency detection works
   - Confirm all links go to housekeep.com

8. **Publish**
   - Click "Publish"
   - Copy the public URL

### Expected URL Format
https://yourname.sites.openai.com/housekeep-service-finder/

### Post-Publish Checklist
- [ ] All 10 test scenarios pass
- [ ] Emergency detection triggers correctly
- [ ] Payment card rejection works
- [ ] CSP headers are active
- [ ] Public access works without sign-in
- [ ] Site appears in search engines (update robots.txt if needed)

### Notes
- This prototype demonstrates the design and conversation flow
- The actual GPT-6 Luna agent would provide natural language responses
- The static version shows the deterministic recommendation logic
- Both versions maintain the same security and privacy standards
