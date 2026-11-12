/* =========================================================
   CiscoExplains — interaksi portal
   ========================================================= */

(() => {
  "use strict";

  const PHONE = "6285111236197";
  const form = document.getElementById("orderForm");

  if (!form) return;

  const deadlineInput = document.getElementById("deadline");
  const detailInput = document.getElementById("detail");
  const charCount = document.getElementById("charCount");
  const chatBubble = document.getElementById("chatBubble");
  const copyBtn = document.getElementById("copyBtn");
  const toast = document.getElementById("toast");
  const toastText = document.getElementById("toastText");
  const header = document.querySelector(".site-header");
  const navToggle = document.querySelector(".nav-toggle");
  const navLinks = document.getElementById("navLinks");

  const fieldIds = [
    "nama",
    "jenis",
    "mapel",
    "tingkat",
    "deadline",
    "jumlah",
    "budget",
    "referensi",
    "detail",
  ];

  const fields = {};
  fieldIds.forEach((id) => {
    fields[id] = document.getElementById(id);
  });

  const prefersReducedMotion = window.matchMedia(
    "(prefers-reduced-motion: reduce)"
  ).matches;

  /* ---------- Bintang di latar ---------- */

  const starsLayer = document.getElementById("stars");
  if (starsLayer) {
    const starCount = window.innerWidth < 640 ? 75 : 140;
    const fragment = document.createDocumentFragment();

    for (let i = 0; i < starCount; i += 1) {
      const star = document.createElement("span");
      const roll = Math.random();
      star.className = "star";

      if (roll > 0.9) {
        star.classList.add("star--bright");
      } else if (roll > 0.84) {
        star.classList.add("star--accent");
      }

      star.style.left = `${Math.random() * 100}%`;
      star.style.top = `${Math.random() * 100}%`;
      star.style.setProperty("--dur", `${3 + Math.random() * 5}s`);
      star.style.setProperty("--delay", `${Math.random() * -9}s`);

      if (roll > 0.94) {
        star.style.width = "3px";
        star.style.height = "3px";
      }

      fragment.appendChild(star);
    }

    starsLayer.appendChild(fragment);
  }

  /* ---------- Tahun footer ---------- */

  const year = document.getElementById("year");
  if (year) year.textContent = String(new Date().getFullYear());

  /* ---------- Header saat scroll ---------- */

  const handleScroll = () => {
    if (header) header.classList.toggle("is-scrolled", window.scrollY > 8);
  };
  handleScroll();
  window.addEventListener("scroll", handleScroll, { passive: true });

  /* ---------- Menu mobile ---------- */

  const closeMenu = () => {
    if (!navToggle || !navLinks) return;
    navToggle.setAttribute("aria-expanded", "false");
    navToggle.setAttribute("aria-label", "Buka menu");
    navLinks.classList.remove("is-open");
  };

  if (navToggle && navLinks) {
    navToggle.addEventListener("click", () => {
      const willOpen = navToggle.getAttribute("aria-expanded") !== "true";
      navToggle.setAttribute("aria-expanded", String(willOpen));
      navToggle.setAttribute(
        "aria-label",
        willOpen ? "Tutup menu" : "Buka menu"
      );
      navLinks.classList.toggle("is-open", willOpen);
    });

    navLinks.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", closeMenu);
    });

    document.addEventListener("click", (event) => {
      if (
        navLinks.classList.contains("is-open") &&
        !navLinks.contains(event.target) &&
        !navToggle.contains(event.target)
      ) {
        closeMenu();
      }
    });

    document.addEventListener("keydown", (event) => {
      if (event.key === "Escape") closeMenu();
    });

    window.addEventListener("resize", () => {
      if (window.innerWidth > 760) closeMenu();
    });
  }

  /* ---------- Toast ---------- */

  let toastTimer;

  const showToast = (message) => {
    if (!toast || !toastText) return;
    toastText.textContent = message;
    toast.classList.add("is-visible");
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toast.classList.remove("is-visible");
    }, 4200);
  };

  /* ---------- Tanggal minimum ---------- */

  const today = new Date();
  const pad = (value) => String(value).padStart(2, "0");
  const todayValue = `${today.getFullYear()}-${pad(
    today.getMonth() + 1
  )}-${pad(today.getDate())}`;

  if (deadlineInput) deadlineInput.min = todayValue;

  /* ---------- Format pesan ---------- */

  const getValue = (id) => (fields[id] ? fields[id].value.trim() : "");

  const formatDeadline = (value) => {
    if (!value) return "—";
    const date = new Date(`${value}T12:00:00`);
    if (Number.isNaN(date.getTime())) return value;

    return new Intl.DateTimeFormat("id-ID", {
      weekday: "long",
      day: "numeric",
      month: "long",
      year: "numeric",
    }).format(date);
  };

  const buildMessage = () => {
    const nama = getValue("nama") || "—";
    const jenis = getValue("jenis") || "—";
    const mapel = getValue("mapel") || "—";
    const tingkat = getValue("tingkat") || "—";
    const jumlah = getValue("jumlah");
    const budget = getValue("budget");
    const referensi = getValue("referensi");
    const detail = getValue("detail") || "—";

    const lines = [
      "Halo Cisco,",
      "",
      "Saya ingin mengajukan pemesanan Joki Tugas melalui CiscoExplains dengan detail berikut.",
      "",
      "*DETAIL PESANAN*",
      `• Nama pemesan: ${nama}`,
      `• Jenis tugas: ${jenis}`,
      `• Mata pelajaran/topik: ${mapel}`,
      `• Tingkat pendidikan: ${tingkat}`,
      `• Deadline: ${formatDeadline(getValue("deadline"))}`,
    ];

    if (jumlah) lines.push(`• Jumlah: ${jumlah}`);
    if (budget) lines.push(`• Budget: ${budget}`);

    lines.push("", "*DESKRIPSI TUGAS*", detail);

    if (referensi) {
      lines.push("", "*REFERENSI*", referensi);
    }

    lines.push(
      "",
      "Mohon konfirmasi ketersediaan, estimasi biaya, dan estimasi waktu pengerjaan. Terima kasih.",
      "",
      "Pesan ini diajukan melalui formulir CiscoExplains."
    );

    return lines.join("\n");
  };

  const escapeHtml = (value) =>
    value
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");

  const renderPreview = () => {
    if (!chatBubble) return;

    const raw = buildMessage();
    const html = escapeHtml(raw).replace(
      /\*([^*\n]+)\*/g,
      "<strong>$1</strong>"
    );
    chatBubble.innerHTML = html;

    const windowEl = chatBubble.closest(".chat-window");
    if (windowEl) windowEl.scrollTop = 0;
  };

  const updateCharCount = () => {
    if (!detailInput || !charCount) return;
    const length = detailInput.value.length;
    charCount.textContent = `${length} / 800`;
    charCount.style.color = length >= 760 ? "var(--orange)" : "";
  };

  /* ---------- Validasi ---------- */

  const validators = {
    nama: (value) => {
      if (value.length < 2) return "Isi nama kamu dulu ya.";
      return "";
    },
    jenis: (value) => (value ? "" : "Pilih jenis tugasnya."),
    mapel: (value) => {
      if (value.length < 3) return "Sebutkan mata pelajaran atau topiknya.";
      return "";
    },
    tingkat: (value) => (value ? "" : "Pilih tingkat pendidikan."),
    deadline: (value) => {
      if (!value) return "Tentukan deadline-nya.";
      const date = new Date(`${value}T00:00:00`);
      const todayStart = new Date();
      todayStart.setHours(0, 0, 0, 0);
      if (date < todayStart) return "Deadline-nya sudah lewat, cek lagi ya.";
      return "";
    },
    detail: (value) => {
      if (value.length < 15)
        return "Ceritakan tugasnya sedikit lebih detail (min. 15 karakter).";
      return "";
    },
  };

  const setError = (id, message) => {
    const input = fields[id];
    const error = document.getElementById(`err-${id}`);
    const field = input ? input.closest(".field") : null;
    if (!input || !error || !field) return;

    field.classList.toggle("has-error", Boolean(message));
    input.setAttribute("aria-invalid", message ? "true" : "false");

    if (message) {
      error.textContent = message;
      error.hidden = false;
      input.setAttribute("aria-describedby", `err-${id}`);
    } else {
      error.hidden = true;
      input.removeAttribute("aria-describedby");
    }
  };

  const validateField = (id) => {
    if (!validators[id] || !fields[id]) return "";
    const message = validators[id](fields[id].value.trim());
    setError(id, message);
    return message;
  };

  const validateForm = () => {
    let firstInvalid = null;

    Object.keys(validators).forEach((id) => {
      const message = validateField(id);
      if (message && !firstInvalid) firstInvalid = fields[id];
    });

    return firstInvalid;
  };

  fieldIds.forEach((id) => {
    const input = fields[id];
    if (!input) return;

    const eventName =
      input.tagName === "SELECT" || input.type === "date" ? "change" : "input";

    input.addEventListener(eventName, () => {
      if (validators[id]) validateField(id);
      renderPreview();
      updateCharCount();
    });
  });

  /* ---------- Submit ke WhatsApp ---------- */

  form.addEventListener("submit", (event) => {
    event.preventDefault();

    const firstInvalid = validateForm();

    if (firstInvalid) {
      firstInvalid.focus({ preventScroll: true });
      firstInvalid.scrollIntoView({ behavior: "smooth", block: "center" });
      showToast("Ada isian yang perlu dicek dulu ya.");
      return;
    }

    const message = buildMessage();
    const url = `https://wa.me/${PHONE}?text=${encodeURIComponent(message)}`;

    const win = window.open(url, "_blank");
    if (win) {
      win.opener = null;
    } else {
      window.location.href = url;
    }

    showToast("WhatsApp dibuka. Tinggal cek pesan lalu kirim! 🚀");
  });

  /* ---------- Reset ---------- */

  form.addEventListener("reset", () => {
    Object.keys(validators).forEach((id) => setError(id, ""));
    window.setTimeout(() => {
      renderPreview();
      updateCharCount();
      showToast("Form sudah direset. Silakan isi lagi.");
    }, 0);
  });

  if (detailInput) {
    detailInput.addEventListener("input", updateCharCount);
  }

  /* ---------- Salin pesan ---------- */

  const fallbackCopy = (text) => {
    const textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();

    let copied = false;
    try {
      copied = document.execCommand("copy");
    } catch {
      copied = false;
    }

    textarea.remove();
    return copied;
  };

  if (copyBtn) {
    copyBtn.addEventListener("click", async () => {
      const message = buildMessage();
      let copied = false;

      try {
        if (navigator.clipboard && window.isSecureContext) {
          await navigator.clipboard.writeText(message);
          copied = true;
        }
      } catch {
        copied = false;
      }

      if (!copied) copied = fallbackCopy(message);

      if (copied) {
        showToast("Pesan disalin. Tinggal paste di WhatsApp! 📋");
      } else {
        showToast("Gagal menyalin. Coba blok pesannya manual ya.");
      }
    });
  }

  /* ---------- Reveal saat scroll ---------- */

  const revealElements = document.querySelectorAll(".reveal");

  if (!("IntersectionObserver" in window) || prefersReducedMotion) {
    revealElements.forEach((element) => element.classList.add("is-visible"));
  } else {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add("is-visible");
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.12, rootMargin: "0px 0px -40px 0px" }
    );

    revealElements.forEach((element) => observer.observe(element));
  }

  /* ---------- Nilai awal ---------- */

  renderPreview();
  updateCharCount();
})();
