"use strict";

(function () {
  const els = {
    text: document.getElementById("text"),
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

  function render() {
    if (!libraryReady()) {
      setStatus(
        "QR library failed to load. Make sure vendor/qrcode.min.js is present.",
        "error"
      );
      return;
    }

    const text = els.text.value.trim();
    if (!text) {
      const ctx = els.canvas.getContext("2d");
      ctx.clearRect(0, 0, els.canvas.width, els.canvas.height);
      setStatus("Enter a URL or text to generate a QR code.");
      return;
    }

    const options = Object.assign({ width: PREVIEW_SIZE }, currentOptions());

    window.QRCode.toCanvas(els.canvas, text, options, function (err) {
      if (err) {
        setStatus("Could not generate QR code: " + err.message, "error");
        return;
      }
      setStatus("QR code ready. Download it as PNG or SVG.", "ok");
    });
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
    const options = Object.assign({ width: size }, currentOptions());

    window.QRCode.toDataURL(text, options, function (err, url) {
      if (err) {
        setStatus("Could not export PNG: " + err.message, "error");
        return;
      }
      triggerDownload(url, safeFilename() + ".png");
      setStatus(`Downloaded PNG (${size}\u00d7${size} px).`, "ok");
    });
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
    const options = Object.assign({ width: size }, currentOptions());

    window.QRCode.toCanvas(text, options, async function (err, canvas) {
      if (err) {
        setStatus("Could not create image: " + err.message, "error");
        return;
      }
      canvas.toBlob(async function (blob) {
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ "image/png": blob }),
          ]);
          setStatus("Image copied to clipboard.", "ok");
        } catch (e) {
          setStatus("Could not copy image: " + e.message, "error");
        }
      }, "image/png");
    });
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
