async function runAudit() {
  console.log("Starting Enterprise E2E QA Audit via API Integration Simulator...");
  
  // 1. Identify running server
  try {
    const res = await fetch('http://localhost:5000/api/health');
    console.log("Server is running on port 5000.");
  } catch (e) {
    console.log("Server is NOT running. We need to start it to run live tests.");
  }
}

runAudit();
