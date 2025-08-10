const express = require('express');
const os = require('os');
const router = express.Router();

// Health check endpoint with comprehensive system information
router.get('/', (req, res) => {
  try {
    const uptime = process.uptime();
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();
    
    const healthData = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      service: 'Collaborative Drawing Canvas',
      version: '1.0.0',
      environment: process.env.NODE_ENV || 'development',
      
      // Process information
      process: {
        pid: process.pid,
        uptime: {
          seconds: Math.floor(uptime),
          formatted: formatUptime(uptime)
        },
        memory: {
          rss: formatBytes(memoryUsage.rss),
          heapUsed: formatBytes(memoryUsage.heapUsed),
          heapTotal: formatBytes(memoryUsage.heapTotal),
          external: formatBytes(memoryUsage.external)
        },
        cpu: {
          user: formatCpuTime(cpuUsage.user),
          system: formatCpuTime(cpuUsage.system)
        }
      },
      
      // System information
      system: {
        platform: os.platform(),
        arch: os.arch(),
        nodeVersion: process.version,
        totalMemory: formatBytes(os.totalmem()),
        freeMemory: formatBytes(os.freemem()),
        loadAverage: os.loadavg(),
        cpus: os.cpus().length
      },
      
      // Application health
      application: {
        status: 'healthy',
        lastCheck: new Date().toISOString()
      }
    };
    
    res.status(200).json(healthData);
  } catch (error) {
    console.error('Health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      error: 'Health check failed',
      message: error.message,
      timestamp: new Date().toISOString()
    });
  }
});

// Detailed health check endpoint
router.get('/detailed', (req, res) => {
  try {
    const detailedHealth = {
      status: 'OK',
      timestamp: new Date().toISOString(),
      checks: {
        process: checkProcessHealth(),
        system: checkSystemHealth(),
        memory: checkMemoryHealth(),
        network: checkNetworkHealth()
      }
    };
    
    // Determine overall status
    const allChecks = Object.values(detailedHealth.checks);
    const failedChecks = allChecks.filter(check => check.status === 'FAILED');
    
    if (failedChecks.length > 0) {
      detailedHealth.status = 'DEGRADED';
      detailedHealth.failedChecks = failedChecks.length;
    }
    
    res.status(200).json(detailedHealth);
  } catch (error) {
    console.error('Detailed health check error:', error);
    res.status(500).json({
      status: 'ERROR',
      error: 'Detailed health check failed',
      message: error.message
    });
  }
});

// Helper functions
function formatUptime(seconds) {
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  
  if (days > 0) return `${days}d ${hours}h ${minutes}m ${secs}s`;
  if (hours > 0) return `${hours}h ${minutes}m ${secs}s`;
  if (minutes > 0) return `${minutes}m ${secs}s`;
  return `${secs}s`;
}

function formatBytes(bytes) {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

function formatCpuTime(microseconds) {
  return (microseconds / 1000000).toFixed(2) + 's';
}

function checkProcessHealth() {
  const memoryUsage = process.memoryUsage();
  const heapUsedPercent = (memoryUsage.heapUsed / memoryUsage.heapTotal) * 100;
  
  return {
    status: heapUsedPercent < 90 ? 'OK' : 'WARNING',
    memoryUsage: heapUsedPercent.toFixed(2) + '%',
    uptime: process.uptime(),
    pid: process.pid
  };
}

function checkSystemHealth() {
  const totalMem = os.totalmem();
  const freeMem = os.freemem();
  const memoryUsagePercent = ((totalMem - freeMem) / totalMem) * 100;
  
  return {
    status: memoryUsagePercent < 90 ? 'OK' : 'WARNING',
    memoryUsage: memoryUsagePercent.toFixed(2) + '%',
    loadAverage: os.loadavg(),
    platform: os.platform()
  };
}

function checkMemoryHealth() {
  const memoryUsage = process.memoryUsage();
  
  return {
    status: 'OK',
    rss: formatBytes(memoryUsage.rss),
    heapUsed: formatBytes(memoryUsage.heapUsed),
    heapTotal: formatBytes(memoryUsage.heapTotal)
  };
}

function checkNetworkHealth() {
  return {
    status: 'OK',
    interfaces: Object.keys(os.networkInterfaces()).length,
    timestamp: new Date().toISOString()
  };
}

module.exports = router; 