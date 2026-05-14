export function initParticles() {
    const container = document.createElement('div');
    container.className = 'bg-particles';
    document.body.appendChild(container);
    const colors = ['#1a5c63', '#4caf50', '#217a82', '#66bb6a'];
    for (let i = 0; i < 15; i++) {
        const p = document.createElement('div');
        p.className = 'particle';
        const size = Math.random() * 80 + 20;
        p.style.cssText = `
            width:${size}px; height:${size}px;
            background:${colors[Math.floor(Math.random() * colors.length)]};
            left:${Math.random() * 100}%;
            animation-duration:${Math.random() * 20 + 15}s;
            animation-delay:-${Math.random() * 20}s`;
        container.appendChild(p);
    }
}
