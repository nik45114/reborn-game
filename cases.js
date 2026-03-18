// Dynamic PC case visuals based on build tier

function getCaseSVG(tierStars) {
    switch(tierStars) {
        case 1: return caseTier1();
        case 2: return caseTier2();
        case 3: return caseTier3();
        case 4: return caseTier4();
        case 5: return caseTier5();
        default: return caseTier1();
    }
}

// ===== TIER 1: Old beige office PC =====
function caseTier1() {
    return `
    <svg viewBox="0 0 300 380" class="case-svg" xmlns="http://www.w3.org/2000/svg">
        <!-- Shadow -->
        <ellipse cx="150" cy="370" rx="100" ry="6" fill="rgba(0,0,0,0.3)"/>

        <!-- Main body - beige/grey old PC -->
        <rect x="40" y="20" width="220" height="320" rx="3" ry="3"
              fill="#c8c0b0" stroke="#a89e8e" stroke-width="2"/>

        <!-- Inner panel - darker -->
        <rect x="50" y="30" width="200" height="300" rx="2" ry="2"
              fill="#b0a898" stroke="#968e7e" stroke-width="1"/>

        <!-- No glass panel - solid side -->
        <!-- Vent holes top -->
        <line x1="60" y1="40" x2="240" y2="40" stroke="#a09888" stroke-width="1"/>
        <line x1="60" y1="45" x2="240" y2="45" stroke="#a09888" stroke-width="1"/>
        <line x1="60" y1="50" x2="240" y2="50" stroke="#a09888" stroke-width="1"/>

        <!-- Drive bay covers -->
        <rect x="55" y="60" width="190" height="18" rx="1" fill="#bab2a2" stroke="#a09888" stroke-width="1"/>
        <rect x="55" y="82" width="190" height="18" rx="1" fill="#bab2a2" stroke="#a09888" stroke-width="1"/>
        <rect x="55" y="104" width="190" height="18" rx="1" fill="#bab2a2" stroke="#a09888" stroke-width="1"/>

        <!-- Blank area -->
        <rect x="55" y="130" width="190" height="140" rx="1" fill="#a8a090" stroke="#968e7e" stroke-width="1"/>

        <!-- Power button -->
        <circle cx="80" cy="300" r="8" fill="#e0d8c8" stroke="#968e7e" stroke-width="1.5"/>
        <circle cx="80" cy="300" r="3" fill="#90b090"/>

        <!-- Power/HDD LED -->
        <rect x="100" y="296" width="6" height="6" rx="1" fill="#4a8" opacity="0.6"/>

        <!-- Bottom grille -->
        <rect x="55" y="280" width="190" height="44" rx="1" fill="none" stroke="#a09888" stroke-width="0.7"
              stroke-dasharray="4,3"/>

        <!-- Feet -->
        <rect x="60" y="340" width="40" height="6" rx="2" fill="#888"/>
        <rect x="200" y="340" width="40" height="6" rx="2" fill="#888"/>

        <!-- Sticker/brand -->
        <rect x="170" y="295" width="50" height="12" rx="2" fill="#d8d0c0" stroke="#b0a898" stroke-width="0.5"/>
        <text x="195" y="304" font-size="7" fill="#888" text-anchor="middle" font-family="sans-serif">BASIC</text>

        <!-- Yellowed tint overlay -->
        <rect x="40" y="20" width="220" height="320" rx="3" fill="rgba(180,160,100,0.08)"/>
    </svg>`;
}

// ===== TIER 2: Simple black office/home PC =====
function caseTier2() {
    return `
    <svg viewBox="0 0 300 380" class="case-svg" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="150" cy="370" rx="100" ry="6" fill="rgba(0,0,0,0.3)"/>

        <!-- Body - black plastic -->
        <rect x="40" y="20" width="220" height="320" rx="4" ry="4"
              fill="#2a2a2e" stroke="#3a3a40" stroke-width="2"/>

        <!-- Side panel with small mesh area -->
        <rect x="50" y="30" width="200" height="300" rx="3" ry="3"
              fill="#222226" stroke="#333338" stroke-width="1"/>

        <!-- Small vent area -->
        <rect x="60" y="50" width="80" height="60" rx="2" fill="none" stroke="#3a3a40" stroke-width="0.7"/>
        ${Array.from({length:8}, (_,i) =>
            `<line x1="65" y1="${55+i*7}" x2="135" y2="${55+i*7}" stroke="#333338" stroke-width="0.8"/>`
        ).join('')}

        <!-- Drive bay -->
        <rect x="160" y="50" width="80" height="25" rx="2" fill="#1e1e22" stroke="#3a3a40" stroke-width="0.8"/>
        <rect x="160" y="80" width="80" height="25" rx="2" fill="#1e1e22" stroke="#3a3a40" stroke-width="0.8"/>

        <!-- Main area -->
        <rect x="60" y="120" width="180" height="150" rx="2" fill="#1a1a1e" stroke="#333338" stroke-width="0.8"/>

        <!-- Fan outline -->
        <circle cx="150" cy="195" r="35" fill="none" stroke="#333338" stroke-width="1"/>
        <circle cx="150" cy="195" r="25" fill="none" stroke="#2e2e32" stroke-width="0.5"/>
        <circle cx="150" cy="195" r="5" fill="#333338"/>

        <!-- PSU area -->
        <rect x="60" y="275" width="180" height="50" rx="2" fill="#1e1e22" stroke="#333338" stroke-width="0.8"/>
        <rect x="160" y="285" width="70" height="30" rx="2" fill="none" stroke="#3a3a40" stroke-width="0.7"
              stroke-dasharray="3,2"/>

        <!-- Power button -->
        <circle cx="75" cy="38" r="5" fill="#1e1e22" stroke="#4a4a50" stroke-width="1"/>
        <circle cx="75" cy="38" r="2" fill="#5a5">
            <animate attributeName="opacity" values="1;0.5;1" dur="3s" repeatCount="indefinite"/>
        </circle>

        <!-- Feet -->
        <rect x="55" y="340" width="30" height="5" rx="2" fill="#1a1a1e"/>
        <rect x="215" y="340" width="30" height="5" rx="2" fill="#1a1a1e"/>
    </svg>`;
}

// ===== TIER 3: Gaming PC with glass panel =====
function caseTier3() {
    return `
    <svg viewBox="0 0 300 380" class="case-svg" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="150" cy="370" rx="100" ry="6" fill="rgba(0,0,0,0.4)"/>

        <!-- Body - dark steel -->
        <rect x="35" y="15" width="230" height="335" rx="6" ry="6"
              fill="#1a1d24" stroke="#2d3340" stroke-width="2.5"/>

        <!-- Glass panel (transparent dark) -->
        <rect x="45" y="25" width="210" height="315" rx="4" ry="4"
              fill="rgba(20,25,35,0.7)" stroke="#3a4455" stroke-width="1.5"/>

        <!-- Internal motherboard tray -->
        <rect x="55" y="35" width="185" height="210" rx="3" fill="#0d1117" opacity="0.8"/>

        <!-- MB PCB -->
        <rect x="60" y="40" width="175" height="200" rx="2" fill="#111820" stroke="#1a2530" stroke-width="1"/>

        <!-- CPU socket -->
        <rect x="100" y="70" width="40" height="40" rx="2" fill="#1a2028" stroke="#2a3545" stroke-width="1"/>

        <!-- RAM slots -->
        <rect x="155" y="55" width="6" height="50" rx="1" fill="#1a2028" stroke="#2a3545" stroke-width="0.7"/>
        <rect x="165" y="55" width="6" height="50" rx="1" fill="#1a2028" stroke="#2a3545" stroke-width="0.7"/>

        <!-- Fan -->
        <circle cx="85" cy="85" r="22" fill="none" stroke="#2a3545" stroke-width="1.5"/>
        <circle cx="85" cy="85" r="6" fill="#2a3545"/>

        <!-- GPU area -->
        <rect x="65" y="170" width="160" height="25" rx="3" fill="#151b25" stroke="#2a3545" stroke-width="1"/>

        <!-- PSU shroud -->
        <rect x="45" y="250" width="210" height="3" fill="#2d3340"/>

        <!-- PSU -->
        <rect x="130" y="260" width="110" height="65" rx="3" fill="#151b22" stroke="#2a3545" stroke-width="1"/>
        <circle cx="185" cy="293" r="18" fill="none" stroke="#2a3545" stroke-width="1"/>

        <!-- Single RGB strip -->
        <rect x="48" y="248" width="205" height="2" rx="1" fill="url(#rgb1)" opacity="0.7"/>

        <!-- Front IO -->
        <circle cx="255" cy="35" r="4" fill="#1a1d24" stroke="#3a7a5a" stroke-width="1.5">
            <animate attributeName="opacity" values="1;0.4;1" dur="2s" repeatCount="indefinite"/>
        </circle>

        <!-- Feet -->
        <rect x="50" y="350" width="35" height="6" rx="3" fill="#111418"/>
        <rect x="215" y="350" width="35" height="6" rx="3" fill="#111418"/>

        <defs>
            <linearGradient id="rgb1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#3b82f6"/>
                <stop offset="50%" stop-color="#6366f1"/>
                <stop offset="100%" stop-color="#3b82f6"/>
            </linearGradient>
        </defs>
    </svg>`;
}

// ===== TIER 4: Pro Gaming RGB PC =====
function caseTier4() {
    return `
    <svg viewBox="0 0 300 380" class="case-svg" xmlns="http://www.w3.org/2000/svg">
        <ellipse cx="150" cy="370" rx="105" ry="7" fill="rgba(100,50,200,0.15)"/>

        <!-- RGB ambient glow -->
        <ellipse cx="150" cy="350" rx="130" ry="20" fill="rgba(100,50,220,0.08)"/>

        <!-- Body -->
        <rect x="30" y="10" width="240" height="345" rx="8" ry="8"
              fill="#111318" stroke="#2a2f40" stroke-width="2.5"/>

        <!-- Glass panel with tint -->
        <rect x="40" y="20" width="220" height="325" rx="6" ry="6"
              fill="rgba(15,18,28,0.6)" stroke="#3a4560" stroke-width="1.5"/>

        <!-- Glass reflection -->
        <line x1="42" y1="22" x2="42" y2="343" stroke="rgba(255,255,255,0.04)" stroke-width="2"/>

        <!-- Internal -->
        <rect x="50" y="30" width="195" height="220" rx="3" fill="#080b12"/>

        <!-- MB -->
        <rect x="55" y="35" width="185" height="210" rx="2" fill="#0d1118" stroke="#182030" stroke-width="1"/>

        <!-- CPU block -->
        <rect x="95" y="65" width="45" height="45" rx="3" fill="#12181f" stroke="#2a3a50" stroke-width="1.5"/>
        <!-- AIO cooler pump head -->
        <circle cx="117" cy="87" r="15" fill="#151c28" stroke="#4060a0" stroke-width="1.5"/>
        <circle cx="117" cy="87" r="6" fill="url(#pumpRGB)"/>

        <!-- RAM with RGB tops -->
        <rect x="155" y="45" width="8" height="55" rx="1" fill="#151c28" stroke="#2a3a50" stroke-width="0.8"/>
        <rect x="155" y="45" width="8" height="4" rx="1" fill="url(#ramRGB1)"/>
        <rect x="167" y="45" width="8" height="55" rx="1" fill="#151c28" stroke="#2a3a50" stroke-width="0.8"/>
        <rect x="167" y="45" width="8" height="4" rx="1" fill="url(#ramRGB1)"/>

        <!-- AIO radiator + fans top -->
        <rect x="60" y="35" width="120" height="22" rx="2" fill="#12181f" stroke="#2a3545" stroke-width="1"/>
        <circle cx="80" cy="46" r="8" fill="none" stroke="#2a3a50" stroke-width="0.8">
            <animateTransform attributeName="transform" type="rotate" values="0 80 46;360 80 46" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="105" cy="46" r="8" fill="none" stroke="#2a3a50" stroke-width="0.8">
            <animateTransform attributeName="transform" type="rotate" values="0 105 46;360 105 46" dur="2s" repeatCount="indefinite"/>
        </circle>
        <circle cx="130" cy="46" r="8" fill="none" stroke="#2a3a50" stroke-width="0.8">
            <animateTransform attributeName="transform" type="rotate" values="0 130 46;360 130 46" dur="2s" repeatCount="indefinite"/>
        </circle>

        <!-- AIO tubes -->
        <path d="M100,65 Q85,60 80,55" fill="none" stroke="#222" stroke-width="3" stroke-linecap="round"/>
        <path d="M135,65 Q145,60 150,55" fill="none" stroke="#222" stroke-width="3" stroke-linecap="round"/>

        <!-- GPU - big triple fan -->
        <rect x="60" y="165" width="170" height="35" rx="4" fill="#12181f" stroke="#2a3a50" stroke-width="1.5"/>
        <circle cx="95" cy="182" r="12" fill="none" stroke="#2a3545" stroke-width="1">
            <animateTransform attributeName="transform" type="rotate" values="0 95 182;360 95 182" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="135" cy="182" r="12" fill="none" stroke="#2a3545" stroke-width="1">
            <animateTransform attributeName="transform" type="rotate" values="0 135 182;360 135 182" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="175" cy="182" r="12" fill="none" stroke="#2a3545" stroke-width="1">
            <animateTransform attributeName="transform" type="rotate" values="0 175 182;360 175 182" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <!-- GPU RGB strip -->
        <rect x="62" y="200" width="166" height="2" rx="1" fill="url(#gpuRGB)"/>

        <!-- PSU shroud -->
        <rect x="40" y="255" width="220" height="3" fill="#1a1f2a"/>

        <!-- RGB strips -->
        <rect x="43" y="253" width="216" height="2" rx="1" fill="url(#mainRGB)" opacity="0.8"/>
        <!-- Side RGB -->
        <rect x="43" y="20" width="2" height="325" rx="1" fill="url(#sideRGB)" opacity="0.5"/>

        <!-- PSU -->
        <rect x="135" y="265" width="115" height="68" rx="4" fill="#111318" stroke="#2a3040" stroke-width="1"/>
        <circle cx="192" cy="300" r="20" fill="none" stroke="#1e2530" stroke-width="1"/>

        <!-- Front panel RGB strip -->
        <rect x="260" y="20" width="3" height="325" rx="1" fill="url(#frontRGB)" opacity="0.6"/>

        <!-- Power button -->
        <circle cx="263" cy="15" r="3" fill="url(#pumpRGB)"/>

        <!-- Feet -->
        <rect x="45" y="355" width="35" height="6" rx="3" fill="#0d0f14"/>
        <rect x="220" y="355" width="35" height="6" rx="3" fill="#0d0f14"/>

        <defs>
            <linearGradient id="mainRGB" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#ef4444"><animate attributeName="stop-color" values="#ef4444;#3b82f6;#ef4444" dur="3s" repeatCount="indefinite"/></stop>
                <stop offset="33%" stop-color="#22c55e"><animate attributeName="stop-color" values="#22c55e;#a855f7;#22c55e" dur="3s" repeatCount="indefinite"/></stop>
                <stop offset="66%" stop-color="#3b82f6"><animate attributeName="stop-color" values="#3b82f6;#f59e0b;#3b82f6" dur="3s" repeatCount="indefinite"/></stop>
                <stop offset="100%" stop-color="#a855f7"><animate attributeName="stop-color" values="#a855f7;#ef4444;#a855f7" dur="3s" repeatCount="indefinite"/></stop>
            </linearGradient>
            <linearGradient id="sideRGB" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#6366f1"/><stop offset="50%" stop-color="#a855f7"/><stop offset="100%" stop-color="#6366f1"/>
            </linearGradient>
            <linearGradient id="frontRGB" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#a855f7"><animate attributeName="stop-color" values="#a855f7;#3b82f6;#a855f7" dur="4s" repeatCount="indefinite"/></stop>
                <stop offset="100%" stop-color="#6366f1"><animate attributeName="stop-color" values="#6366f1;#a855f7;#6366f1" dur="4s" repeatCount="indefinite"/></stop>
            </linearGradient>
            <linearGradient id="gpuRGB" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#3b82f6"/><stop offset="50%" stop-color="#8b5cf6"/><stop offset="100%" stop-color="#3b82f6"/>
            </linearGradient>
            <radialGradient id="pumpRGB">
                <stop offset="0%" stop-color="#818cf8"><animate attributeName="stop-color" values="#818cf8;#c084fc;#818cf8" dur="2s" repeatCount="indefinite"/></stop>
                <stop offset="100%" stop-color="#4f46e5"/>
            </radialGradient>
            <linearGradient id="ramRGB1" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#22c55e"><animate attributeName="stop-color" values="#22c55e;#3b82f6;#22c55e" dur="2s" repeatCount="indefinite"/></stop>
                <stop offset="100%" stop-color="#3b82f6"><animate attributeName="stop-color" values="#3b82f6;#22c55e;#3b82f6" dur="2s" repeatCount="indefinite"/></stop>
            </linearGradient>
        </defs>
    </svg>`;
}

// ===== TIER 5: Ultimate Custom PC =====
function caseTier5() {
    return `
    <svg viewBox="0 0 300 380" class="case-svg" xmlns="http://www.w3.org/2000/svg">
        <!-- Epic glow -->
        <ellipse cx="150" cy="350" rx="140" ry="25" fill="rgba(245,158,11,0.1)"/>
        <ellipse cx="150" cy="190" rx="160" ry="180" fill="rgba(245,158,11,0.03)"/>

        <!-- Body - premium -->
        <rect x="25" y="5" width="250" height="355" rx="10" ry="10"
              fill="#0d0f14" stroke="#c89b3c" stroke-width="2"/>

        <!-- Glass panel -->
        <rect x="35" y="15" width="230" height="335" rx="8" ry="8"
              fill="rgba(10,12,18,0.5)" stroke="rgba(200,155,60,0.4)" stroke-width="1.5"/>

        <!-- Reflection -->
        <line x1="37" y1="17" x2="37" y2="348" stroke="rgba(255,255,255,0.05)" stroke-width="3"/>

        <!-- Custom loop distro plate (left side) -->
        <rect x="40" y="20" width="25" height="325" rx="3" fill="rgba(10,12,18,0.8)" stroke="rgba(200,155,60,0.3)" stroke-width="1"/>
        <!-- Coolant tubes -->
        <rect x="48" y="30" width="8" height="305" rx="4" fill="rgba(100,200,255,0.15)" stroke="rgba(100,200,255,0.3)" stroke-width="0.5"/>
        <!-- Coolant flow animation -->
        <rect x="49" y="30" width="6" height="20" rx="3" fill="rgba(100,200,255,0.3)">
            <animate attributeName="y" values="30;315;30" dur="4s" repeatCount="indefinite"/>
        </rect>

        <!-- Internal -->
        <rect x="70" y="25" width="180" height="215" rx="3" fill="#080a10"/>

        <!-- MB - premium -->
        <rect x="75" y="30" width="170" height="205" rx="2" fill="#0d1018" stroke="#1a2535" stroke-width="1"/>

        <!-- Custom water block on CPU -->
        <rect x="105" y="65" width="50" height="50" rx="5" fill="#0f1520" stroke="rgba(200,155,60,0.5)" stroke-width="1.5"/>
        <circle cx="130" cy="90" r="16" fill="url(#goldPump)" stroke="rgba(200,155,60,0.6)" stroke-width="1"/>
        <text x="130" y="94" font-size="9" fill="rgba(200,155,60,0.8)" text-anchor="middle" font-family="sans-serif" font-weight="bold">ROG</text>

        <!-- Water tubes from CPU -->
        <path d="M110,65 Q90,50 55,45" fill="none" stroke="rgba(100,200,255,0.3)" stroke-width="4" stroke-linecap="round"/>
        <path d="M150,65 Q165,50 55,100" fill="none" stroke="rgba(100,200,255,0.3)" stroke-width="4" stroke-linecap="round"/>

        <!-- RAM - 4 sticks with RGB -->
        <rect x="170" y="42" width="7" height="55" rx="1" fill="#12182a" stroke="#2a3a55" stroke-width="0.7"/>
        <rect x="170" y="42" width="7" height="5" rx="1" fill="url(#goldRam)"/>
        <rect x="180" y="42" width="7" height="55" rx="1" fill="#12182a" stroke="#2a3a55" stroke-width="0.7"/>
        <rect x="180" y="42" width="7" height="5" rx="1" fill="url(#goldRam)"/>
        <rect x="190" y="42" width="7" height="55" rx="1" fill="#12182a" stroke="#2a3a55" stroke-width="0.7"/>
        <rect x="190" y="42" width="7" height="5" rx="1" fill="url(#goldRam)"/>
        <rect x="200" y="42" width="7" height="55" rx="1" fill="#12182a" stroke="#2a3a55" stroke-width="0.7"/>
        <rect x="200" y="42" width="7" height="5" rx="1" fill="url(#goldRam)"/>

        <!-- Top radiator -->
        <rect x="75" y="30" width="140" height="22" rx="2" fill="#0f1520" stroke="#1e2a3a" stroke-width="1"/>
        <circle cx="100" cy="41" r="8" fill="none" stroke="rgba(200,155,60,0.3)" stroke-width="0.8">
            <animateTransform attributeName="transform" type="rotate" values="0 100 41;360 100 41" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="125" cy="41" r="8" fill="none" stroke="rgba(200,155,60,0.3)" stroke-width="0.8">
            <animateTransform attributeName="transform" type="rotate" values="0 125 41;360 125 41" dur="1.5s" repeatCount="indefinite"/>
        </circle>
        <circle cx="150" cy="41" r="8" fill="none" stroke="rgba(200,155,60,0.3)" stroke-width="0.8">
            <animateTransform attributeName="transform" type="rotate" values="0 150 41;360 150 41" dur="1.5s" repeatCount="indefinite"/>
        </circle>

        <!-- GPU - flagship with waterblock -->
        <rect x="75" y="165" width="170" height="40" rx="4" fill="#0f1520" stroke="rgba(200,155,60,0.4)" stroke-width="1.5"/>
        <rect x="80" y="170" width="40" height="30" rx="3" fill="#111825" stroke="rgba(100,200,255,0.3)" stroke-width="1"/>
        <text x="100" y="189" font-size="7" fill="rgba(200,155,60,0.6)" text-anchor="middle" font-family="sans-serif">4090</text>
        <!-- GPU water block glow -->
        <rect x="80" y="200" width="160" height="3" rx="1" fill="url(#goldStrip)"/>

        <!-- PSU shroud -->
        <rect x="35" y="248" width="230" height="3" fill="#151820"/>

        <!-- Golden RGB strips -->
        <rect x="38" y="246" width="224" height="2" rx="1" fill="url(#goldStrip)" opacity="0.9"/>
        <rect x="38" y="15" width="2" height="335" rx="1" fill="url(#goldSide)" opacity="0.4"/>
        <rect x="260" y="15" width="2" height="335" rx="1" fill="url(#goldSide)" opacity="0.4"/>

        <!-- PSU -->
        <rect x="145" y="260" width="105" height="70" rx="4" fill="#0d0f14" stroke="#1e2530" stroke-width="1"/>
        <text x="197" y="300" font-size="8" fill="rgba(200,155,60,0.5)" text-anchor="middle" font-family="sans-serif">1200W</text>

        <!-- SSD with heatsink -->
        <rect x="80" y="260" width="50" height="15" rx="2" fill="#12182a" stroke="#2a3550" stroke-width="0.8"/>

        <!-- Crown emblem -->
        <text x="150" y="340" font-size="20" text-anchor="middle" opacity="0.15">👑</text>

        <!-- Power -->
        <circle cx="263" cy="12" r="3" fill="url(#goldPump)"/>

        <!-- Feet -->
        <rect x="40" y="360" width="40" height="6" rx="3" fill="#0d0f14"/>
        <rect x="220" y="360" width="40" height="6" rx="3" fill="#0d0f14"/>

        <defs>
            <radialGradient id="goldPump">
                <stop offset="0%" stop-color="#f59e0b"><animate attributeName="stop-color" values="#f59e0b;#fbbf24;#f59e0b" dur="2s" repeatCount="indefinite"/></stop>
                <stop offset="100%" stop-color="#b45309"/>
            </radialGradient>
            <linearGradient id="goldStrip" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#f59e0b"><animate attributeName="stop-color" values="#f59e0b;#fbbf24;#f59e0b" dur="3s" repeatCount="indefinite"/></stop>
                <stop offset="50%" stop-color="#fbbf24"><animate attributeName="stop-color" values="#fbbf24;#f59e0b;#fbbf24" dur="3s" repeatCount="indefinite"/></stop>
                <stop offset="100%" stop-color="#f59e0b"><animate attributeName="stop-color" values="#f59e0b;#fbbf24;#f59e0b" dur="3s" repeatCount="indefinite"/></stop>
            </linearGradient>
            <linearGradient id="goldSide" x1="0%" y1="0%" x2="0%" y2="100%">
                <stop offset="0%" stop-color="#f59e0b"/><stop offset="50%" stop-color="#fbbf24"/><stop offset="100%" stop-color="#f59e0b"/>
            </linearGradient>
            <linearGradient id="goldRam" x1="0%" y1="0%" x2="100%" y2="0%">
                <stop offset="0%" stop-color="#f59e0b"><animate attributeName="stop-color" values="#f59e0b;#fbbf24;#f59e0b" dur="1.5s" repeatCount="indefinite"/></stop>
                <stop offset="100%" stop-color="#fbbf24"><animate attributeName="stop-color" values="#fbbf24;#f59e0b;#fbbf24" dur="1.5s" repeatCount="indefinite"/></stop>
            </linearGradient>
        </defs>
    </svg>`;
}
