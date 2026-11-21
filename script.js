(function () {
  "use strict";
  var C = window.REUNI_CONFIG || {};
  var $ = function (id) { return document.getElementById(id); };

  // ---- Isi teks dari konfigurasi ----
  document.title = "Pendaftaran " + C.namaAcara;
  $("sekolah").textContent = C.sekolah || "";
  $("judul").textContent = C.namaAcara || "Reuni Akbar Alumni";
  var info = $("info");
  [["📅", C.tanggal], ["🕗", C.waktu], ["📍", C.tempat]].forEach(function (x) {
    if (!x[1]) return;
    var s = document.createElement("span");
    s.className = "chip";
    s.textContent = x[0] + " " + x[1];
    info.appendChild(s);
  });
  $("tahun").textContent = new Date().getFullYear();
  if (C.batasDaftar) $("batas").textContent = "Batas pendaftaran: " + C.batasDaftar;

  // Pilihan tahun lulus (terbaru di atas)
  var sel = $("angkatan");
  for (var y = C.tahunLulusAkhir; y >= C.tahunLulusAwal; y--) {
    var o = document.createElement("option");
    o.value = o.textContent = String(y);
    sel.appendChild(o);
  }

  // ---- Jumlah pendaftar (opsional) ----
  if (C.apiUrl) {
    fetch(C.apiUrl).then(function (r) { return r.json(); }).then(function (d) {
      if (d && d.ok && typeof d.total === "number" && d.total > 0)
        $("counter").textContent = d.total + " alumni sudah mendaftar";
    }).catch(function () {});
  }

  // ---- Utilitas ----
  function normWA(v) {
    var d = String(v).replace(/\D/g, "");
    if (d.indexOf("0") === 0) d = "62" + d.slice(1);
    else if (d.indexOf("8") === 0) d = "62" + d;
    return d;
  }
  function setInvalid(el, bad) {
    var wrap = el.closest(".field");
    if (wrap) wrap.classList.toggle("invalid", bad);
  }
  function showAlert(msg) {
    var a = $("alert");
    a.innerHTML = "";
    a.textContent = msg;
    a.style.display = msg ? "block" : "none";
  }

  // ---- Validasi ----
  var LABEL_NAMA = { wa: "No. HP (WhatsApp)", tglLahir: "Tanggal lahir", setuju: "Persetujuan penggunaan data" };
  function labelOf(id) {
    if (LABEL_NAMA[id]) return LABEL_NAMA[id];
    var l = document.querySelector('label[for="' + id + '"]');
    return l ? l.textContent.replace(/\*/g, "").replace(/\(.*?\)/g, "").replace(/\s+/g, " ").trim() : id;
  }

  // Gulir ke kolom, beri sorotan, dan fokus
  function goTo(id) {
    var el = $(id);
    if (!el) return;
    var box = el.closest(".field") || el.closest(".check") || el;
    box.scrollIntoView({ behavior: "smooth", block: "center" });
    box.classList.remove("flash");
    void box.offsetWidth;
    box.classList.add("flash");
    setTimeout(function () { try { el.focus({ preventScroll: true }); } catch (x) { el.focus(); } }, 350);
  }

  // Tampilkan daftar kolom bermasalah, setiap item bisa diklik untuk menuju kolomnya
  function showProblems(ids, intro) {
    var a = $("alert");
    a.innerHTML = "";
    var p = document.createElement("div");
    p.className = "alert-title";
    p.textContent = intro;
    a.appendChild(p);
    var ul = document.createElement("div");
    ul.className = "alert-list";
    ids.forEach(function (id) {
      var b = document.createElement("button");
      b.type = "button";
      b.textContent = "→ " + labelOf(id);
      b.addEventListener("click", function () { goTo(id); });
      ul.appendChild(b);
    });
    a.appendChild(ul);
    a.style.display = "block";
  }

  // Mengembalikan daftar id kolom yang belum benar (kosong = semua benar)
  function validate() {
    var bad = [];
    function check(id, isBad) {
      setInvalid($(id), isBad);
      if (isBad) bad.push(id);
    }
    ["nama", "panggilan", "angkatan", "tempatLahir", "tglLahir", "alamat", "wa", "email", "medsos", "profesi", "kaos", "harapan"].forEach(function (id) {
      var v = $(id).value.trim();
      var isBad = !v;
      if (!isBad && id === "tglLahir") isBad = v < "1940-01-01" || v > new Date().toISOString().slice(0, 10);
      if (!isBad && id === "wa") isBad = !/^62\d{8,13}$/.test(normWA(v));
      if (!isBad && id === "email") isBad = !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v);
      check(id, isBad);
    });
    var sBad = !$("setuju").checked;
    $("setujuErr").style.display = sBad ? "block" : "none";
    if (sBad) bad.push("setuju");
    return bad;
  }

  // Hapus tanda galat begitu kolom diperbaiki
  document.querySelectorAll("#form input, #form select, #form textarea").forEach(function (el) {
    ["input", "change"].forEach(function (ev) {
      el.addEventListener(ev, function () {
        var wrap = el.closest(".field");
        if (wrap) wrap.classList.remove("invalid");
        if (el.id === "setuju") $("setujuErr").style.display = "none";
      });
    });
  });

  // ---- Kirim ----
  $("form").addEventListener("submit", function (e) {
    e.preventDefault();
    showAlert("");
    var bad = validate();
    if (bad.length) {
      showProblems(bad, bad.length + " isian perlu dilengkapi atau diperbaiki. Klik untuk menuju kolomnya:");
      goTo(bad[0]);
      return;
    }
    if (!C.apiUrl) {
      showAlert("Formulir belum disambungkan ke Google Sheets. Panitia perlu mengisi apiUrl pada config.js (lihat README).");
      return;
    }
    var payload = {
      nama: $("nama").value.trim(),
      panggilan: $("panggilan").value.trim(),
      angkatan: $("angkatan").value,
      wa: normWA($("wa").value),
      email: $("email").value.trim(),
      tempatLahir: $("tempatLahir").value.trim(),
      tglLahir: $("tglLahir").value,
      alamat: $("alamat").value.trim(),
      medsos: $("medsos").value.trim(),
      profesi: $("profesi").value.trim(),
      jumlah: $("jumlah").value,
      kaos: $("kaos").value,
      harapan: $("harapan").value.trim(),
      panitia: $("panitia").checked ? "Ya" : "Tidak",
      sponsor: $("sponsor").checked ? "Ya" : "Tidak",
      website: document.querySelector('input[name="website"]').value
    };
    var btn = $("kirim");
    btn.disabled = true;
    btn.textContent = "Mengirim…";

    fetch(C.apiUrl, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    })
      .then(function (r) { return r.json(); })
      .then(function (d) {
        if (!d || !d.ok) {
          var e = new Error((d && d.error) || "Gagal menyimpan data.");
          e.field = d && d.field;
          throw e;
        }
        tampilSukses(payload, d.kode);
      })
      .catch(function (err) {
        if (err.field && $(err.field)) {
          setInvalid($(err.field), true);
          showProblems([err.field], err.message);
          goTo(err.field);
        } else if (err.message === "Data wajib belum lengkap.") {
          // Pesan dari Apps Script versi lama
          showAlert("Semua isian sudah terisi, tetapi server pendaftaran masih memakai versi lama. Panitia perlu menempel ulang Code.gs terbaru dan membuat versi deployment baru (lihat README).");
        } else {
          showAlert(err.message === "Failed to fetch"
            ? "Koneksi bermasalah. Periksa internet Anda lalu coba lagi."
            : err.message);
        }
        btn.disabled = false;
        btn.textContent = "Daftar Sekarang";
      });
  });

  function tampilSukses(p, kode) {
    $("form").style.display = "none";
    $("sNama").textContent = p.nama;
    $("sKode").textContent = kode;
    $("sBiaya").textContent = C.biayaInfo || "";
    var aksi = $("sAksi");
    aksi.innerHTML = "";
    if (C.linkGrupWA) addBtn(aksi, "Gabung grup WhatsApp alumni", C.linkGrupWA, false);
    if (C.kontakPanitiaWA) {
      var t = encodeURIComponent("Assalamu'alaikum, saya " + p.nama + " (angkatan " + p.angkatan + "). Kode pendaftaran reuni saya: " + kode);
      addBtn(aksi, "Konfirmasi ke " + (C.kontakPanitiaNama || "panitia"), "https://wa.me/" + C.kontakPanitiaWA + "?text=" + t, true);
    }
    $("success").style.display = "block";
    window.scrollTo({ top: 0, behavior: "smooth" });
  }
  function addBtn(parent, text, href, alt) {
    var a = document.createElement("a");
    a.className = "btn" + (alt ? " alt" : "");
    a.textContent = text;
    a.href = href;
    a.target = "_blank";
    a.rel = "noopener";
    parent.appendChild(a);
  }
})();
