# Autonomous CI CD Healing and Docker Security Agent

Autonomous CI CD Healing and Docker Security Agent is an AI powered DevOps automation platform that detects, analyzes, and automatically fixes CI CD pipeline failures. After successfully healing the pipeline, the system builds and scans Docker images for vulnerabilities and generates a complete security report. All results are displayed in a modern React dashboard.

This platform reduces manual debugging effort, improves pipeline reliability, and enhances application security.

---

## 🚀 Features

### Autonomous CI CD Healing
Automatically clones repositories, detects failures, applies fixes, commits changes, and retries execution until the pipeline passes successfully.

### Failure Detection and Auto Fixing
Detects and fixes common issues such as  
Linting errors  
Missing dependencies  
Syntax errors  
Import errors  
Configuration issues  

### Docker Vulnerability Scanning
Builds Docker images and scans them using Trivy to identify vulnerabilities and security risks.

### Security Report Generation
Generates detailed reports including vulnerability severity, affected packages, and recommended fixes.

### Multi Agent Architecture
Uses specialized agents for cloning, execution, analysis, fixing, committing, scanning, and reporting.

### React Dashboard
Displays pipeline status, retry history, execution timeline, and security summary.

### Secure Execution
Runs in sandboxed environments and never pushes directly to the main branch.

---

## 🏗️ Project Structure

```
backend/
│
├── src/
│   ├── agent/
│   │   ├── agents.js
│   │   ├── langGraphRunner.js
│   │   └── runAgent.js
│   │
│   ├── services/
│   │   ├── git.service.js
│   │   ├── pipelineExecutor.service.js
│   │   ├── pipelineParser.service.js
│   │   ├── failureAnalyzer.service.js
│   │   ├── fixer.service.js
│   │   └── securityScan.service.js
│   │
│   ├── routes/
│   │   └── agent.routes.js
│   │
│   └── utils/
│       └── branchName.js
│
├── sandbox/
├── results.json
└── server.js

frontend/
└── React dashboard
```

---

## ⚙️ Setup and Installation

### 1 Clone the Repository

```
git clone https://github.com/your-repository-url
cd your-project-folder
```

### 2 Install Backend Dependencies

```
npm install
```

### 3 Start Backend Server

```
npm start
```

Backend runs at

```
http://localhost:3000
```

### 4 Start Frontend

```
cd frontend
npm install
npm run dev
```

---

## 🧑‍💻 Usage

Send POST request to run the autonomous agent

```
http://localhost:3000/api/agent/run
```

Request body example

```
{
  "repoUrl": "https://github.com/user/repository",
  "teamName": "RIFT ORGANISERS",
  "leaderName": "Saiyam Kumar",
  "githubToken": "your_github_token"
}
```

The agent will automatically

Clone repository  
Create branch  
Execute pipeline  
Detect failures  
Apply fixes  
Commit changes  
Retry execution  
Build Docker image  
Scan vulnerabilities  
Generate report  
Display results in dashboard  

---

## 📊 Example Output

```
{
  "repoUrl": "https://github.com/user/repository",
  "branch": "RIFT_ORGANISERS_SAIYAM_KUMAR_AI_Fix",
  "retryUsed": "2 of 5",
  "status": "PASSED",
  "securitySummary": {
    "critical": 1,
    "high": 4,
    "medium": 7,
    "low": 3
  }
}
```

---

## 🔒 Branch Naming Rule

Required format

```
TEAM_NAME_LEADER_NAME_AI_Fix
```

Example

```
RIFT_ORGANISERS_SAIYAM_KUMAR_AI_Fix
```

Rules

Uppercase letters only  
Use underscores  
Never push to main branch  

---

## 🛡️ Security and Safety

Sandboxed execution environment  
No direct push to main branch  
GitHub tokens are never stored  
Docker containers cleaned after execution  
Safe pipeline execution  

---

## 🤖 Architecture Overview

The system uses multiple agents working together

Repo Agent clones repository  
Pipeline Agent detects workflow  
Executor Agent runs pipeline  
Analyzer Agent detects failures  
Fixer Agent applies fixes  
Git Agent commits changes  
Security Agent scans Docker image  
Report Agent generates final report  

---

## 🧰 Tech Stack

Backend  
Node.js  
Express.js  
LangGraph  
Docker  
Trivy  
simple git  

Frontend  
React  
Context API  

---

## 📄 License

MIT License

---

## 🙏 Acknowledgements

LangGraph  
LangChain  
Docker  
Trivy  
React  
Node.js  
Express.js  

---

## 🗺️ Roadmap

Support for more programming languages  
Advanced failure detection  
Cloud deployment support  
Improved dashboard analytics  
Automated Dockerfile security improvements  

---

## 👥 Team

Team Name  
RIFT ORGANISERS  

Team Lead  
Saiyam Kumar  

---

## 🏁 Summary

This project delivers a fully autonomous DevOps agent capable of healing CI CD pipelines, scanning Docker images for vulnerabilities, and presenting results in a professional dashboard. It reduces developer workload and improves security and reliability.
