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
  var foot = "© " + new Date().getFullYear() + " Panitia " + (C.namaAcara || "Reuni");
  if (C.batasDaftar) foot = "Batas pendaftaran: " + C.batasDaftar + ". " + foot;
  $("footer").textContent = foot;

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
    a.textContent = msg;
    a.style.display = msg ? "block" : "none";
  }

  // ---- Validasi ----
  function validate() {
    var ok = true;
    ["nama", "angkatan", "domisili"].forEach(function (id) {
      var bad = !$(id).value.trim();
      setInvalid($(id), bad);
      if (bad) ok = false;
    });
    var wa = normWA($("wa").value);
    var waBad = !/^62\d{8,13}$/.test(wa);
    setInvalid($("wa"), waBad);
    if (waBad) ok = false;
    var em = $("email").value.trim();
    var emBad = em !== "" && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(em);
    setInvalid($("email"), emBad);
    if (emBad) ok = false;
    var sBad = !$("setuju").checked;
    $("setujuErr").style.display = sBad ? "block" : "none";
    if (sBad) ok = false;
    return ok;
  }

  // ---- Kirim ----
  $("form").addEventListener("submit", function (e) {
    e.preventDefault();
    showAlert("");
    if (!validate()) {
      var first = document.querySelector(".invalid input,.invalid select");
      if (first) first.focus();
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
      domisili: $("domisili").value.trim(),
      pekerjaan: $("pekerjaan").value.trim(),
      jumlah: $("jumlah").value,
      kaos: $("kaos").value,
      pesan: $("pesan").value.trim(),
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
        if (!d || !d.ok) throw new Error((d && d.error) || "Gagal menyimpan data.");
        tampilSukses(payload, d.kode);
      })
      .catch(function (err) {
        showAlert(err.message === "Failed to fetch"
          ? "Koneksi bermasalah. Periksa internet Anda lalu coba lagi."
          : err.message);
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
