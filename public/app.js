"use strict";

(function () {
  const els = {
    text: document.getElementById("text"),
    icon: document.getElementById("icon"),
    brandColorField: document.getElementById("brandColorField"),
    brandColor: document.getElementById("brandColor"),
    fgColor: document.getElementById("fgColor"),
    fgColorHex: document.getElementById("fgColorHex"),
    transparentBg: document.getElementById("transparentBg"),
    bgColorField: document.getElementById("bgColorField"),
    bgColor: document.getElementById("bgColor"),
    bgColorHex: document.getElementById("bgColorHex"),
    ecLevel: document.getElementById("ecLevel"),
    margin: document.getElementById("margin"),
    size: document.getElementById("size"),
    sizeValue: document.getElementById("sizeValue"),
    canvas: document.getElementById("canvas"),
    downloadPng: document.getElementById("downloadPng"),
    downloadSvg: document.getElementById("downloadSvg"),
    copyPng: document.getElementById("copyPng"),
    status: document.getElementById("status"),
  };

  const PREVIEW_SIZE = 640;
  let debounceTimer = null;
  let renderSeq = 0;

  // Brand glyphs from Simple Icons (CC0); generic glyphs are simple 24x24 strokes.
  const fill = (d) => (c) => `<path fill="${c}" d="${d}"/>`;
  const stroke = (inner) => (c) =>
    `<g fill="none" stroke="${c}" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">${inner}</g>`;

  const ICONS = {
    linkedin: {
      label: "LinkedIn",
      color: "#0a66c2",
      body: fill("M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"),
    },
    instagram: {
      label: "Instagram",
      color: "#e4405f",
      body: fill("M12 0C8.74 0 8.333.015 7.053.072 5.775.132 4.905.333 4.14.63c-.789.306-1.459.717-2.126 1.384S.935 3.35.63 4.14C.333 4.905.131 5.775.072 7.053.012 8.333 0 8.74 0 12s.015 3.667.072 4.947c.06 1.277.261 2.148.558 2.913.306.788.717 1.459 1.384 2.126.667.666 1.336 1.079 2.126 1.384.766.296 1.636.499 2.913.558C8.333 23.988 8.74 24 12 24s3.667-.015 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.718 2.126-1.384.666-.667 1.079-1.335 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.072-1.687.072-4.947s-.015-3.667-.072-4.947c-.06-1.277-.262-2.149-.558-2.913-.306-.789-.718-1.459-1.384-2.126C21.319 1.347 20.651.935 19.86.63c-.765-.297-1.636-.499-2.913-.558C15.667.012 15.26 0 12 0zm0 2.16c3.203 0 3.585.016 4.85.071 1.17.055 1.805.249 2.227.415.562.217.96.477 1.382.896.419.42.679.819.896 1.381.164.422.36 1.057.413 2.227.057 1.266.07 1.646.07 4.85s-.015 3.585-.074 4.85c-.061 1.17-.256 1.805-.421 2.227-.224.562-.479.96-.899 1.382-.419.419-.824.679-1.38.896-.42.164-1.065.36-2.235.413-1.274.057-1.649.07-4.859.07-3.211 0-3.586-.015-4.859-.074-1.171-.061-1.816-.256-2.236-.421-.569-.224-.96-.479-1.379-.899-.421-.419-.69-.824-.9-1.38-.165-.42-.359-1.065-.42-2.235-.045-1.26-.061-1.649-.061-4.844 0-3.196.016-3.586.061-4.861.061-1.17.255-1.814.42-2.234.21-.57.479-.96.9-1.381.419-.419.81-.689 1.379-.898.42-.166 1.051-.361 2.221-.421 1.275-.045 1.65-.06 4.859-.06l.045.03zm0 3.678c-3.405 0-6.162 2.76-6.162 6.162 0 3.405 2.76 6.162 6.162 6.162 3.405 0 6.162-2.76 6.162-6.162 0-3.405-2.76-6.162-6.162-6.162zM12 16c-2.21 0-4-1.79-4-4s1.79-4 4-4 4 1.79 4 4-1.79 4-4 4zm7.846-10.405c0 .795-.646 1.44-1.44 1.44-.795 0-1.44-.646-1.44-1.44 0-.794.646-1.439 1.44-1.439.793-.001 1.44.645 1.44 1.439z"),
    },
    x: {
      label: "X (Twitter)",
      color: "#000000",
      body: fill("M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"),
    },
    facebook: {
      label: "Facebook",
      color: "#0866ff",
      body: fill("M9.101 23.691v-7.98H6.627v-3.667h2.474v-1.58c0-4.085 1.848-5.978 5.858-5.978.401 0 .955.042 1.468.103a8.68 8.68 0 0 1 1.141.195v3.325a8.623 8.623 0 0 0-.653-.036 26.805 26.805 0 0 0-.733-.009c-.707 0-1.259.096-1.675.309a1.686 1.686 0 0 0-.679.622c-.258.42-.374.995-.374 1.752v1.297h3.919l-.386 2.103-.287 1.564h-3.246v8.245C19.396 23.238 24 18.179 24 12.044c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.628 3.874 10.35 9.101 11.647Z"),
    },
    youtube: {
      label: "YouTube",
      color: "#ff0000",
      body: fill("M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"),
    },
    tiktok: {
      label: "TikTok",
      color: "#000000",
      body: fill("M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.57-.26-1.1-.59-1.62-.93-.01 2.92.01 5.84-.02 8.75-.08 1.4-.54 2.79-1.35 3.94-1.31 1.92-3.58 3.17-5.91 3.21-1.43.08-2.86-.31-4.08-1.03-2.02-1.19-3.44-3.37-3.65-5.71-.02-.5-.03-1-.01-1.49.18-1.9 1.12-3.72 2.58-4.96 1.66-1.44 3.98-2.13 6.15-1.72.02 1.48-.04 2.96-.04 4.44-.99-.32-2.15-.23-3.02.37-.63.41-1.11 1.04-1.36 1.75-.21.51-.15 1.07-.14 1.61.24 1.64 1.82 3.02 3.5 2.87 1.12-.01 2.19-.66 2.77-1.61.19-.33.4-.67.41-1.06.1-1.79.06-3.57.07-5.36.01-4.03-.01-8.05.02-12.07z"),
    },
    github: {
      label: "GitHub",
      color: "#181717",
      body: fill("M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"),
    },
    whatsapp: {
      label: "WhatsApp",
      color: "#25d366",
      body: fill("M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"),
    },
    telegram: {
      label: "Telegram",
      color: "#26a5e4",
      body: fill("M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.635z"),
    },
    website: {
      label: "Website",
      body: stroke('<circle cx="12" cy="12" r="10"/><path d="M2 12h20M12 2a15 15 0 0 1 0 20M12 2a15 15 0 0 0 0 20"/>'),
    },
    email: {
      label: "Email",
      body: stroke('<rect x="2" y="4" width="20" height="16" rx="2"/><path d="m2 7 10 6 10-6"/>'),
    },
    phone: {
      label: "Phone",
      body: stroke('<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 1.9.7 2.8a2 2 0 0 1-.5 2.1L8.1 9.9a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.8.7a2 2 0 0 1 1.7 2z"/>'),
    },
  };

  Object.keys(ICONS).forEach((key) => {
    els.icon.add(new Option(ICONS[key].label, key));
  });

  function setStatus(message, kind) {
    els.status.textContent = message || "";
    els.status.className = "status" + (kind ? ` status--${kind}` : "");
  }

  function normalizeHex(value, fallback) {
    const v = String(value || "").trim();
    if (/^#[0-9a-fA-F]{6}$/.test(v)) return v.toLowerCase();
    if (/^#[0-9a-fA-F]{3}$/.test(v)) {
      return (
        "#" +
        v[1] + v[1] + v[2] + v[2] + v[3] + v[3]
      ).toLowerCase();
    }
    return fallback;
  }

  function currentOptions() {
    const dark = normalizeHex(els.fgColorHex.value, "#000000");
    const light = els.transparentBg.checked
      ? "#00000000"
      : normalizeHex(els.bgColorHex.value, "#ffffff");

    return {
      errorCorrectionLevel: els.ecLevel.value,
      margin: Math.max(0, Math.min(16, parseInt(els.margin.value, 10) || 0)),
      color: { dark, light },
    };
  }

  function libraryReady() {
    return typeof window.QRCode !== "undefined";
  }

  function selectedIcon() {
    return ICONS[els.icon.value] || null;
  }

  function iconColor(icon) {
    return els.brandColor.checked && icon.color
      ? icon.color
      : normalizeHex(els.fgColorHex.value, "#000000");
  }

  // Icon area in module units, snapped to whole modules and kept small enough for Q/H recovery.
  function logoGeometry(text, opts) {
    const n = window.QRCode.create(text, {
      errorCorrectionLevel: opts.errorCorrectionLevel,
    }).modules.size;
    let size = Math.round(n * 0.26);
    if ((n - size) % 2) size += 1;
    const pad = Math.max(0.5, size * 0.1);
    return {
      total: n + 2 * opts.margin,
      start: opts.margin + (n - size) / 2,
      size,
      pad,
    };
  }

  function iconSvg(icon, px) {
    return `<svg xmlns="http://www.w3.org/2000/svg" width="${px}" height="${px}" viewBox="0 0 24 24">${icon.body(iconColor(icon))}</svg>`;
  }

  function drawLogo(canvas, text, opts) {
    const icon = selectedIcon();
    if (!icon) return Promise.resolve(canvas);

    const g = logoGeometry(text, opts);
    const scale = canvas.width / g.total;
    const a = Math.round(g.start * scale);
    const b = Math.round((g.start + g.size) * scale);
    const ctx = canvas.getContext("2d");
    if (els.transparentBg.checked) {
      ctx.clearRect(a, a, b - a, b - a);
    } else {
      ctx.fillStyle = opts.color.light;
      ctx.fillRect(a, a, b - a, b - a);
    }

    const pos = (g.start + g.pad) * scale;
    const px = (g.size - 2 * g.pad) * scale;
    return new Promise(function (resolve, reject) {
      const img = new Image();
      img.onload = function () {
        ctx.drawImage(img, pos, pos, px, px);
        resolve(canvas);
      };
      img.onerror = function () {
        reject(new Error("icon failed to load"));
      };
      img.src =
        "data:image/svg+xml;charset=utf-8," +
        encodeURIComponent(iconSvg(icon, Math.ceil(px)));
    });
  }

  function addLogoToSvg(svg, text, opts) {
    const icon = selectedIcon();
    if (!icon) return svg;

    const g = logoGeometry(text, opts);
    const r = (v) => +v.toFixed(3);
    const defs =
      `<defs><mask id="qr-icon-cut" maskUnits="userSpaceOnUse" x="0" y="0" width="${g.total}" height="${g.total}">` +
      `<rect width="${g.total}" height="${g.total}" fill="#fff"/>` +
      `<rect x="${g.start}" y="${g.start}" width="${g.size}" height="${g.size}" fill="#000"/>` +
      `</mask></defs>`;
    const pos = r(g.start + g.pad);
    const px = r(g.size - 2 * g.pad);
    const glyph = `<svg x="${pos}" y="${pos}" width="${px}" height="${px}" viewBox="0 0 24 24" shape-rendering="geometricPrecision">${icon.body(iconColor(icon))}</svg>`;

    return svg
      .replace("<path stroke=", defs + '<path mask="url(#qr-icon-cut)" stroke=')
      .replace(/<\/svg>\s*$/, glyph + "</svg>\n");
  }

  function buildCanvas(text, width) {
    const opts = Object.assign({ width }, currentOptions());
    return new Promise(function (resolve, reject) {
      window.QRCode.toCanvas(text, opts, function (err, canvas) {
        if (err) reject(err);
        else resolve(canvas);
      });
    }).then((canvas) => drawLogo(canvas, text, opts));
  }

  // An icon covers modules, so L/M recovery is not enough to keep it scannable.
  function syncEcLevel() {
    const icon = selectedIcon();
    Array.from(els.ecLevel.options).forEach(function (opt) {
      opt.disabled = !!icon && (opt.value === "L" || opt.value === "M");
    });
    if (els.ecLevel.selectedOptions[0].disabled) els.ecLevel.value = "H";
    els.brandColorField.hidden = !(icon && icon.color);
  }

  function render() {
    if (!libraryReady()) {
      setStatus(
        "QR library failed to load. Make sure vendor/qrcode.min.js is present.",
        "error"
      );
      return;
    }

    const text = els.text.value.trim();
    const seq = ++renderSeq;
    if (!text) {
      const ctx = els.canvas.getContext("2d");
      ctx.clearRect(0, 0, els.canvas.width, els.canvas.height);
      setStatus("Enter a URL or text to generate a QR code.");
      return;
    }

    buildCanvas(text, PREVIEW_SIZE).then(
      function (canvas) {
        if (seq !== renderSeq) return;
        els.canvas.width = canvas.width;
        els.canvas.height = canvas.height;
        els.canvas.getContext("2d").drawImage(canvas, 0, 0);
        setStatus("QR code ready. Download it as PNG or SVG.", "ok");
      },
      function (err) {
        if (seq !== renderSeq) return;
        setStatus("Could not generate QR code: " + err.message, "error");
      }
    );
  }

  function scheduleRender() {
    clearTimeout(debounceTimer);
    debounceTimer = setTimeout(render, 120);
  }

  function triggerDownload(href, filename) {
    const a = document.createElement("a");
    a.href = href;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  }

  function safeFilename() {
    const raw = els.text.value.trim() || "qr-code";
    const cleaned = raw
      .replace(/^https?:\/\//i, "")
      .replace(/[^a-z0-9]+/gi, "-")
      .replace(/^-+|-+$/g, "")
      .toLowerCase()
      .slice(0, 40);
    return (cleaned || "qr-code") + "-qr";
  }

  function downloadPng() {
    if (!libraryReady()) return;
    const text = els.text.value.trim();
    if (!text) {
      setStatus("Enter a URL or text first.", "error");
      return;
    }
    const size = parseInt(els.size.value, 10) || 1024;

    buildCanvas(text, size).then(
      function (canvas) {
        triggerDownload(canvas.toDataURL("image/png"), safeFilename() + ".png");
        setStatus(`Downloaded PNG (${size}\u00d7${size} px).`, "ok");
      },
      function (err) {
        setStatus("Could not export PNG: " + err.message, "error");
      }
    );
  }

  function downloadSvg() {
    if (!libraryReady()) return;
    const text = els.text.value.trim();
    if (!text) {
      setStatus("Enter a URL or text first.", "error");
      return;
    }
    const options = currentOptions();

    window.QRCode.toString(
      text,
      Object.assign({ type: "svg" }, options),
      function (err, svg) {
        if (err) {
          setStatus("Could not export SVG: " + err.message, "error");
          return;
        }
        svg = addLogoToSvg(svg, text, options);
        const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
        const url = URL.createObjectURL(blob);
        triggerDownload(url, safeFilename() + ".svg");
        setTimeout(() => URL.revokeObjectURL(url), 1000);
        setStatus("Downloaded scalable SVG (best for print).", "ok");
      }
    );
  }

  async function copyPng() {
    if (!libraryReady()) return;
    if (!navigator.clipboard || !window.ClipboardItem) {
      setStatus("Copying images is not supported in this browser.", "error");
      return;
    }
    const text = els.text.value.trim();
    if (!text) {
      setStatus("Enter a URL or text first.", "error");
      return;
    }
    const size = parseInt(els.size.value, 10) || 1024;

    // Passing a promise keeps the click's user activation while the icon loads.
    const blobPromise = buildCanvas(text, size).then(function (canvas) {
      return new Promise(function (resolve, reject) {
        canvas.toBlob(function (blob) {
          if (blob) resolve(blob);
          else reject(new Error("PNG encoding failed"));
        }, "image/png");
      });
    });

    try {
      await navigator.clipboard.write([
        new ClipboardItem({ "image/png": blobPromise }),
      ]);
      setStatus("Image copied to clipboard.", "ok");
    } catch (e) {
      setStatus("Could not copy image: " + e.message, "error");
    }
  }

  // Keep color picker and hex text in sync.
  function bindColorPair(picker, hex, fallback) {
    picker.addEventListener("input", function () {
      hex.value = picker.value;
      scheduleRender();
    });
    hex.addEventListener("input", function () {
      const normalized = normalizeHex(hex.value, null);
      if (normalized) {
        picker.value = normalized;
        scheduleRender();
      }
    });
    hex.addEventListener("blur", function () {
      hex.value = normalizeHex(hex.value, fallback);
      picker.value = hex.value;
    });
  }

  bindColorPair(els.fgColor, els.fgColorHex, "#000000");
  bindColorPair(els.bgColor, els.bgColorHex, "#ffffff");

  els.transparentBg.addEventListener("change", function () {
    els.bgColorField.hidden = els.transparentBg.checked;
    scheduleRender();
  });

  els.icon.addEventListener("change", function () {
    syncEcLevel();
    scheduleRender();
  });
  els.brandColor.addEventListener("change", scheduleRender);

  els.size.addEventListener("input", function () {
    els.sizeValue.textContent = els.size.value;
  });

  ["input", "change"].forEach((evt) => {
    els.text.addEventListener(evt, scheduleRender);
    els.ecLevel.addEventListener(evt, scheduleRender);
    els.margin.addEventListener(evt, scheduleRender);
  });

  els.downloadPng.addEventListener("click", downloadPng);
  els.downloadSvg.addEventListener("click", downloadSvg);
  els.copyPng.addEventListener("click", copyPng);

  // Initial render once the page (and CDN script) has loaded.
  window.addEventListener("load", render);
})();
