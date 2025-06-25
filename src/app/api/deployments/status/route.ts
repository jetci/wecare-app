import { NextResponse } from 'next/server';

export async function GET() {
  // Sample deployment metrics
  const deploymentStats = {
    pendingCount: Math.floor(Math.random() * 5),
    successCount: Math.floor(Math.random() * 50),
    failureCount: Math.floor(Math.random() * 10),
    lastDeployed: new Date().toISOString(),
  };
  return NextResponse.json(deploymentStats);
}
