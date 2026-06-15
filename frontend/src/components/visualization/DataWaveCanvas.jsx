import React from 'react';

const DataWaveCanvas = () => {
    // Generate wave paths with different amplitudes, frequencies, and phases
    const generateWavePath = (amplitude, frequency, phaseShift, yOffset) => {
        const width = 800;
        const height = 120;
        const points = [];
        const step = width / 100; // 100 segments for smoothness

        for (let x = 0; x <= width; x += step) {
            const t = x / width;
            const angle = t * Math.PI * 2 * frequency + phaseShift;
            const y = yOffset + amplitude * Math.sin(angle);
            points.push(`${x},${y}`);
        }

        return `M ${points.join(' L ')}`;
    };

    // Wave layers configuration: amplitude, frequency, phase shift, y offset, opacity, animation delay
    const waves = [
        { amp: 8, freq: 1.2, phase: 0, yOffset: 60, opacity: 0.15, delay: '0s' },
        { amp: 12, freq: 1.8, phase: 0.5, yOffset: 58, opacity: 0.2, delay: '-0.5s' },
        { amp: 6, freq: 2.5, phase: 1.2, yOffset: 62, opacity: 0.25, delay: '-1s' },
        { amp: 15, freq: 1.0, phase: 2.0, yOffset: 55, opacity: 0.1, delay: '-1.5s' },
        { amp: 10, freq: 3.0, phase: 0.8, yOffset: 60, opacity: 0.18, delay: '-2s' },
        { amp: 5, freq: 4.0, phase: 1.5, yOffset: 65, opacity: 0.22, delay: '-2.5s' },
        { amp: 18, freq: 0.8, phase: 2.5, yOffset: 50, opacity: 0.08, delay: '-3s' },
        { amp: 7, freq: 2.2, phase: 3.0, yOffset: 58, opacity: 0.2, delay: '-3.5s' },
        { amp: 4, freq: 5.0, phase: 0.3, yOffset: 70, opacity: 0.15, delay: '-4s' },
        { amp: 20, freq: 0.6, phase: 1.8, yOffset: 45, opacity: 0.06, delay: '-4.5s' }
    ];

    return (
        <div className="telemetry-wave">
            <svg className="wave-svg" viewBox="0 0 800 120" preserveAspectRatio="none">
                {waves.map((wave, idx) => {
                    const pathData = generateWavePath(wave.amp, wave.freq, wave.phase, wave.yOffset);
                    return (
                        <path
                            key={idx}
                            className="wave-path wave-layer"
                            d={pathData}
                            fill="none"
                            stroke="var(--scanner-primary)"
                            strokeWidth="1.5"
                            opacity={wave.opacity}
                            style={{ animationDelay: wave.delay }}
                        />
                    );
                })}
                {/* Optional fill area for the primary wave */}
                <path
                    className="wave-fill wave-layer"
                    d={generateWavePath(12, 1.5, 0, 60) + ' L 800 120 L 0 120 Z'}
                    fill="var(--scanner-glow)"
                    opacity="0.15"
                    style={{ animationDelay: '0s' }}
                />
            </svg>
        </div>
    );
};

export default DataWaveCanvas;