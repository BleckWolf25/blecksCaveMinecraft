/**
 * @file particleSystem.ts
 *
 * @version 1.0.0
 * @author Bleckwolf25
 * @license MIT
 *
 * @summary Optimized interactive canvas particle animation network.
 *
 * @description
 * Manages the background floating particle animation on the portal landing screen, employing a 2D spatial partitioning grid to optimize O(N) neighbor distance lookups and rendering mouse-repulsion physics and dynamic interconnecting lines.
 *
 * @since 25/06/2026
 * @updated 04/07/2026
 */
// ---------- INTERFACES & TYPE DEFINITIONS
export interface CleanupCallback {
  (): void;
}

interface MouseState {
  x: number | null;
  y: number | null;
  radius: number;
}

// ---------- MODULE STATE VARIABLES
let particleAnimationId: number | null = null;

// ---------- PARTICLE SYSTEM INITIALIZATION API
/**
 * Initializes a canvas particle network background for the portal dashboard.
 * @param canvas - The target canvas element.
 * @returns Cleanup handler.
 */
export function initParticles(canvas: HTMLCanvasElement): CleanupCallback {
  const ctx = canvas.getContext('2d');
  // ---------- GUARD CLAUSE (verify 2D rendering context exists)
  if (!ctx) {
    return () => {};
  }

  // ---------- CANVAS & PARTICLE CONFIGURATION
  let width = (canvas.width = window.innerWidth);
  let height = (canvas.height = window.innerHeight);

  const particles: Particle[] = [];
  const particleCount = Math.min(80, Math.floor((width * height) / 20000));
  const mouse: MouseState = { x: null, y: null, radius: 150 };

  // Spatial partitioning grid for optimization
  const GRID_SIZE = 100; // Size of each grid cell in pixels
  const CONNECTION_DISTANCE = 100; // Max distance for drawing connections

  // ---------- CLASS: PARTICLE
  class Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    radius: number;

    constructor() {
      this.x = Math.random() * width;
      this.y = Math.random() * height;
      this.vx = (Math.random() - 0.5) * 0.4;
      this.vy = (Math.random() - 0.5) * 0.4;
      this.radius = Math.random() * 2 + 1;
    }

    // ---------- POSITION & VELOCITY UPDATE
    update() {
      this.x += this.vx;
      this.y += this.vy;

      if (this.x < 0 || this.x > width) {
        this.vx *= -1;
      }
      if (this.y < 0 || this.y > height) {
        this.vy *= -1;
      }

      // Mouse interactive push
      if (mouse.x !== null && mouse.y !== null) {
        const dx = this.x - mouse.x;
        const dy = this.y - mouse.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < mouse.radius) {
          const force = (mouse.radius - dist) / mouse.radius;
          this.x += (dx / dist) * force * 1.5;
          this.y += (dy / dist) * force * 1.5;
        }
      }
    }

    // ---------- CANVAS RENDERING
    draw() {
      if (!ctx) {
        return;
      }
      ctx.beginPath();
      ctx.rect(this.x, this.y, this.radius * 2, this.radius * 2);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.fill();
    }
  }

  for (let i = 0; i < particleCount; i++) {
    particles.push(new Particle());
  }

  // ---------- SPATIAL PARTITIONING GRID LOGIC
  function getGridCell(x: number, y: number): { x: number; y: number } {
    return {
      x: Math.floor(x / GRID_SIZE),
      y: Math.floor(y / GRID_SIZE)
    };
  }

  function buildSpatialGrid(): Map<string, Particle[]> {
    const grid = new Map<string, Particle[]>();
    
    particles.forEach(p => {
      const cell = getGridCell(p.x, p.y);
      const key = `${cell.x},${cell.y}`;
      
      if (!grid.has(key)) {
        grid.set(key, []);
      }
      grid.get(key)!.push(p);
    });
    
    return grid;
  }

  function getNearbyParticles(particle: Particle, grid: Map<string, Particle[]>): Particle[] {
    const cell = getGridCell(particle.x, particle.y);
    const nearby: Particle[] = [];
    
    // Check current cell and adjacent cells (3x3 grid)
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const checkKey = `${cell.x + dx},${cell.y + dy}`;
        const cellParticles = grid.get(checkKey);
        if (cellParticles) {
          nearby.push(...cellParticles);
        }
      }
    }
    
    return nearby;
  }

  // ---------- EVENT LISTENERS & RESIZE HANDLING
  let resizeTimeout: number;
  function handleResize() {
    window.clearTimeout(resizeTimeout);
    resizeTimeout = window.setTimeout(() => {
      width = canvas.width = window.innerWidth;
      height = canvas.height = window.innerHeight;
    }, 150);
  }

  function handleMouseMove(e: MouseEvent) {
    mouse.x = e.clientX;
    mouse.y = e.clientY;
  }

  function handleMouseLeave() {
    mouse.x = null;
    mouse.y = null;
  }

  let isVisible = true;
  function handleVisibilityChange() {
    isVisible = document.visibilityState === 'visible';
    if (isVisible) {
      animate();
    }
  }

  window.addEventListener('resize', handleResize);
  window.addEventListener('mousemove', handleMouseMove);
  window.addEventListener('mouseleave', handleMouseLeave);
  document.addEventListener('visibilitychange', handleVisibilityChange);

  // ---------- MAIN ANIMATION LOOP
  function animate() {
    // ---------- GUARD CLAUSES (stop rendering when hidden or unmounted)
    if (!isVisible) {
      return;
    }
    if (!ctx) {
      return;
    }
    ctx.clearRect(0, 0, width, height);

    // Update and draw particles
    particles.forEach(p => {
      p.update();
      p.draw();
    });

    // Build spatial grid for this frame
    const grid = buildSpatialGrid();

    // Draw connecting lines using spatial partitioning
    const drawnConnections = new Set<string>();
    
    particles.forEach(p => {
      const nearby = getNearbyParticles(p, grid);
      
      nearby.forEach(other => {
        // Avoid duplicate connections and self-connections
        const connectionKey = p.x < other.x ? `${p.x},${p.y}-${other.x},${other.y}` : `${other.x},${other.y}-${p.x},${p.y}`;
        if (drawnConnections.has(connectionKey) || p === other) {
          return;
        }
        
        const dx = p.x - other.x;
        const dy = p.y - other.y;
        const dist = Math.sqrt(dx * dx + dy * dy);

        if (dist < CONNECTION_DISTANCE) {
          const alpha = ((CONNECTION_DISTANCE - dist) / CONNECTION_DISTANCE) * 0.12;
          ctx.beginPath();
          ctx.moveTo(p.x, p.y);
          ctx.lineTo(other.x, other.y);
          ctx.strokeStyle = `rgba(255, 255, 255, ${alpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
          drawnConnections.add(connectionKey);
        }
      });
    });

    particleAnimationId = requestAnimationFrame(animate);
  }

  animate();

  // ---------- CLEANUP CALLBACK
  return () => {
    if (particleAnimationId !== null) {
      cancelAnimationFrame(particleAnimationId);
    }
    window.clearTimeout(resizeTimeout);
    window.removeEventListener('resize', handleResize);
    window.removeEventListener('mousemove', handleMouseMove);
    window.removeEventListener('mouseleave', handleMouseLeave);
    document.removeEventListener('visibilitychange', handleVisibilityChange);
  };
}

// ---------- GLOBAL ANIMATION CANCELLATION API
/**
 * Cancel any active particle animation
 */
export function cancelParticleAnimation(): void {
  if (particleAnimationId !== null) {
    cancelAnimationFrame(particleAnimationId);
    particleAnimationId = null;
  }
}
