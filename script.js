const isiNav = document.querySelectorAll(".isi-nav"),
LaporanProduk = document.querySelector(".LaporanProduk"),
LaporanPenjualan = document.querySelector(".LaporanPenjualan"),
HeaderLaporanPenjualan = document.querySelector(".header-laporanPenjualan"),
listPenjualan = document.querySelector(".list-laporanPenjualan"),
historyy = document.querySelector(".riwayat"),
rekapan = document.querySelector(".rekapan"),
restock = document.querySelector(".restock")
const variant = new AmbilData("1LDkX8BnwwtiqvRu3eN8Tgy6NKa3UWm97FNORewtToY8", "A"),
informasi = new AmbilData("1LDkX8BnwwtiqvRu3eN8Tgy6NKa3UWm97FNORewtToY8", "D"),
stock = new AmbilData("1LDkX8BnwwtiqvRu3eN8Tgy6NKa3UWm97FNORewtToY8", "B"),
iconNull = "https://i.ibb.co.com/GvNkcn1X/none.webp"


let isActive = 2;

// navbar function
pageActive(isActive)
isiNav.forEach((el, i) => {
    isiNav[isActive > isiNav.length ? isiNav.length : isActive].classList.add("active")
    el.addEventListener("click", (e)=>{
        isiNav.forEach(nav => nav.classList.remove("active"));
        e.currentTarget.classList.add("active");
        isActive = i;
        pageActive(isActive)
    })

})

function pageActive(isActive){
    if(isActive == 0){
        LaporanProduk.style.display = "none"
        LaporanPenjualan.style.display = "none"
        historyy.style.display = "none"
        rekapan.style.display = "flex"
        
    } else if(isActive == 1){
        rekapan.style.display = "none"
        LaporanPenjualan.style.display = "none"
        historyy.style.display = "none"
        laporanProduk()
    } else if(isActive == 2){
        rekapan.style.display = "none"
        LaporanProduk.style.display = "none"
        LaporanPenjualan.style.display = "none"
        restockProduk()

    } else if(isActive == 3){
        rekapan.style.display = "none"
        LaporanProduk.style.display = "none"
        historyy.style.display = "none"
        laporanPenjualan()
        
    } else if(isActive == 4){
        rekapan.style.display = "none"
        LaporanProduk.style.display = "none"
        LaporanPenjualan.style.display = "none"
        riwayat()
    }
}

// pages function
function laporanProduk() {
    var variants = [],
        stocks = [];

    LaporanProduk.style.display = "grid";
    LaporanProduk.innerHTML = "";

    setInterval(() => {
        let isChanged = variants.length === 0

        for (let i = 0; i < variant.result.length; i++) {
            if (variant.result.length !== variants.length || stock.result.length !== stocks.length) {
                variants = variant.result.map(v => v.value);
                stocks = stock.result.map(s => s.value);
                isChanged = true;
                break;
            }

            if (variant.result[i].value !== variants[i] || stock.result[i].value !== stocks[i]) {
                variants[i] = variant.result[i].value;
                stocks[i] = stock.result[i].value;
                isChanged = true;
            }
        }


        if (isChanged) {
            LaporanProduk.innerHTML = "";
            for (let i = 0; i < variants.length; i++) {
                if(variants[i] !== null){
                    LaporanProduk.innerHTML += `
                        <div class='list-laporanproduk'>
                            <div class='variant-laporanproduk'>
                                <p>Variant ${variants[i]}</p>
                            </div>
                            <div class='stok-laporanproduk'>
                                <p>${!stocks[i] ? 0 : stocks[i]} PCS</p>
                            </div>
                        </div>
                    `;
                }
            }
        }
    }, 100);
}

// Restock
function restockProduk() {
    let lastDataJSON = null;

    setInterval(() => {
        let result = [];

        for (let i = 0; i < informasi.result.length; i++) {
            let tandaMatch = informasi.result[i].value.match(/\((.*?)\)/);
            let tanda = tandaMatch ? tandaMatch[1].trim() : null;

            if (tanda === "+") {
                result.push(informasi.result[i]);
            }
        }

        result.sort((a, b) => {
            let [ta, ja] = [
                a.value.match(/\[([^\]]+)\]/)?.[1],
                a.value.match(/\{([^}]+)\}/)?.[1]
            ];
            let [tb, jb] = [
                b.value.match(/\[([^\]]+)\]/)?.[1],
                b.value.match(/\{([^}]+)\}/)?.[1]
            ];

            let dateA = parseTanggalJam(ta, ja);
            let dateB = parseTanggalJam(tb, jb);

            return dateB - dateA;
        });

        let currentDataJSON = JSON.stringify(result.map(r => r.value));
        if (currentDataJSON === lastDataJSON) {
            return;
        }
        lastDataJSON = currentDataJSON;

        let allVariants = [];
        result.forEach(item => {
            let varianPartMatch = item.value.match(/\$\{([^}]+)\}/);
            if (varianPartMatch) {
                let variants = varianPartMatch[1].split(",").map(v => v.split("<")[0].trim());
                allVariants.push(variants);
            }
        });

        let masterVariants = allVariants.sort((a, b) => b.length - a.length)[0] || [];

        let html = "";
        result.forEach(item => {
            let tanggalMatch = item.value.match(/\[([^\]]+)\]/);
            let tanggal = tanggalMatch ? tanggalMatch[1].trim() : "";

            let varianObj = {};
            let varianPartMatch = item.value.match(/\$\{([^}]+)\}/);
            if (varianPartMatch) {
                let pairs = varianPartMatch[1].split(",");
                pairs.forEach(p => {
                    let [nama, jumlah] = p.split("<").map(s => s.trim());
                    varianObj[nama] = jumlah || "0";
                });
            }

            html += `
            <div id="restock-container">
                <div class="restock-item">
                    <div class="restock-header">
                        <h3>${ubahFormatTanggal(tanggal)}</h3>
                    </div>
                    <div class="restock-variants">
                        ${masterVariants.map(v => `
                            <div class="variant">
                                <span class="label">${v}</span>
                                <span class="value">${varianObj[v] || "0"} pcs</span>
                            </div>
                        `).join("")}
                    </div>
                </div>
            </div>
            `;
        });

        restock.innerHTML = html;

    }, 100);

    function parseTanggalJam(tanggalStr, jamStr) {
        if (!tanggalStr) return new Date(0);
        let [d, m, y] = tanggalStr.split("/").map(n => parseInt(n, 10));
        let [hh, mm] = jamStr ? [jamStr.slice(0, 2), jamStr.slice(2)] : [0, 0];
        return new Date(y, m - 1, d, hh, mm);
    }
}



// Contoh fungsi format tanggal
function ubahFormatTanggal(tanggalStr) {
    const bulanNama = [
        "Januari", "Februari", "Maret", "April", "Mei", "Juni",
        "Juli", "Agustus", "September", "Oktober", "November", "Desember"
    ];
    const parts = tanggalStr.split('/');
    const hari = parseInt(parts[0], 10);
    const bulanIndex = parseInt(parts[1], 10) - 1;
    const tahun = parts[2];
    return `${hari} ${bulanNama[bulanIndex]} ${tahun}`;
}


// Laporan Penjualan
function laporanPenjualan() {
    LaporanPenjualan.style.display = "block";
    const ListToko = new AmbilData("1LDkX8BnwwtiqvRu3eN8Tgy6NKa3UWm97FNORewtToY8", "J"),
          target = new AmbilData("1LDkX8BnwwtiqvRu3eN8Tgy6NKa3UWm97FNORewtToY8", "I");

    let Informasi = [];
    let lastTarget = null;
    let lastSosmed = [];
    let lastTotal = null;

    setInterval(() => {
        let currentTarget = Number(target.result[0].value) || 0;
        let isChanged = false;

        if (Informasi.length !== informasi.result.length) {
            Informasi = informasi.result.map(info => info.value);
            isChanged = true;
        } else {
            for (let i = 0; i < informasi.result.length; i++) {
                if (informasi.result[i].value !== Informasi[i]) {
                    Informasi[i] = informasi.result[i].value;
                    isChanged = true;
                }
            }
        }

        let total = 0;
        for (let i = 0; i < Informasi.length; i++) {
            let tandaMatch = Informasi[i].match(/\((.*?)\)/);
            let tanda = tandaMatch ? tandaMatch[1].trim() : null;

            if (tanda === "-") {
                const matches = [...Informasi[i].matchAll(/<\s*([0-9]+(?:\.[0-9]+)?)/g)];
                let value = matches.reduce((sum, m) => sum + Number(m[1] || 0), 0);
                total += value;
            }
        }

        let newSosmed = ListToko.result.map(v => v.value);

        let sosmedChanged = JSON.stringify(newSosmed) !== JSON.stringify(lastSosmed);

        if (isChanged || currentTarget !== lastTarget || total !== lastTotal || sosmedChanged) {
            lastTarget = currentTarget;
            lastTotal = total;
            lastSosmed = [...newSosmed];

            HeaderLaporanPenjualan.innerHTML = `
                <div class="informasi-laporanPenjualan">
                    <div class="list-informasi-laporanPenjualan">
                        <p>Target: ${currentTarget} pcs</p>
                        <p>Total: ${total} pcs</p>
                        <p class="kurang">Progress ${(currentTarget === 0 ? 0 : (total / currentTarget * 100)).toFixed(2)}%</p>
                    </div>
                </div>
            `;

            listPenjualan.innerHTML = "";

            let validSosmed = newSosmed.filter(v => v && v.trim() !== "").map(s => s.trim());

            let uniqueSosmed = [...new Set(validSosmed.map(s => {
                let match = s.match(/^(.*?)\s*#/);
                return match ? match[1].trim() : s;
            }))];

            let hasil = {};
            uniqueSosmed.forEach(el => {
                hasil[el] = 0;
            });

            let namaSosmedList = Informasi.map(item =>
                [...item.matchAll(/#(.*?)#/g)].map(m => m[1].trim())
            );

            namaSosmedList.forEach((namaArray, idx) => {
                if (!namaArray.length) return;
                const matches = [...Informasi[idx].matchAll(/<\s*([0-9]+(?:\.[0-9]+)?)/g)];
                let value = matches.reduce((sum, m) => sum + Number(m[1] || 0), 0);

                namaArray.forEach(nama => {
                    let key = uniqueSosmed.find(s => s.toLowerCase() === nama.toLowerCase());
                    if (key) {
                        hasil[key] += value;
                    }
                });
            });

            uniqueSosmed.forEach(sosName => {


                let sosmedAsli = validSosmed.find(v => v.startsWith(sosName));
                let iconMatch = sosmedAsli ? sosmedAsli.match(/#([^#]+)#/) : null;
                let iconUrl = iconMatch ? iconMatch[1] : iconNull;
                console.log(validSosmed)

                let totalTerjual = hasil[sosName] || 0;



                listPenjualan.innerHTML += `
                    <div class="list-sosmed">
                        <div class="profile">
                            <div class="logo">
                                <img src="${iconUrl}" alt="${sosName}">
                            </div>
                            <h1 class="nama-sosmed">${sosName}</h1>
                        </div>
                        <div class="jumlah">
                            <p>Terjual ${totalTerjual} pcs</p>
                        </div>
                    </div>    
                `;
            });
        }
    }, 100);
}

// Fungsi Lanjutan
function ubahFormatTanggal(tanggalStr) {
  if (!tanggalStr) return "";

  const bulanNama = [
    "Januari", "Februari", "Maret", "April", "Mei", "Juni",
    "Juli", "Agustus", "September", "Oktober", "November", "Desember"
  ];

  const parts = tanggalStr.split('/');
  if(parts.length !== 3) return tanggalStr;

  const hari = parseInt(parts[0], 10);
  const bulanIndex = parseInt(parts[1], 10) - 1;
  const tahun = parseInt(parts[2], 10);

  return `${hari} ${bulanNama[bulanIndex]} ${tahun}`;
}


// Riwayat
function riwayat() {
  historyy.style.display = "block";
  let listRiwayat = document.querySelector(".list-riwayat"),
    previousDataJSON = null;

  function update() {
    const data = informasi.result.map(str => {
      const tanggalMatch = str.value.match(/\[([^\]]+)\]/);
      const jamMatch = str.value.match(/\{([^}]+)\}/);
      const namaMatch = str.value.match(/#([^#]+)#/);
      const produkMatch = str.value.match(/\$\{([^}]+)\}/);

      const tanggalAsli = tanggalMatch ? tanggalMatch[1] : null;

      let tanggalObj = null;
      if (tanggalAsli) {
        const parts = tanggalAsli.split('/');
        tanggalObj = new Date(parts[2], parts[1] - 1, parts[0]);
      }

      let jamMenit = null;
      if (jamMatch && jamMatch[1]) {
        const [jam, menit] = jamMatch[1].split('.').map(Number);
        jamMenit = jam * 60 + menit;
      }

      let produkList = [];
      if (produkMatch && produkMatch[1]) {
        produkList = produkMatch[1]
          .split(",")
          .map(item => {
            const [berat, qty] = item.split("<");
            return `${berat.replace(/gr/i, " gram")} x${qty}`;
          });
      }

      return {
        tanggalAsli,
        tanggalTampil: ubahFormatTanggal(tanggalAsli),
        jam: jamMatch ? jamMatch[1] : null,
        jamMenit,
        nama: namaMatch ? namaMatch[1] : null,
        tanggalObj,
        produkList
      };
    });

    data.sort((a, b) => {
      if (b.tanggalObj - a.tanggalObj === 0) {
        return b.jamMenit - a.jamMenit;
      }
      return b.tanggalObj - a.tanggalObj;
    });

    listRiwayat.innerHTML = data
    .map(
        d => `
        <div class="log ${d.nama && d.nama.toLowerCase().includes("affiliate") ? "affiliate-sample" : ""}">
            <div class="icon">
            <img src="${d.nama && d.nama.toLowerCase().includes("affiliate") ? "https://i.ibb.co.com/V0DdVJQK/affiliate.webp" : "https://i.ibb.co.com/VYkQHwgJ/historys.webp"}" alt="" />
            </div>
            <div class="isi">
            <div class="header-info">
                <p class="nama">${d.nama || ''}</p>
                <p class="tanggal">${d.tanggalTampil || ''}, ${d.jam || ''}</p>
            </div>
            <div class="produk">
                ${d.produkList.map(p => `<p>${p}</p>`).join('')}
            </div>
            </div>
        </div>
        `
    )
    .join('');

  }

  function checkUpdate() {
    const currentDataJSON = JSON.stringify(informasi.result);
    if (currentDataJSON !== previousDataJSON) {
      previousDataJSON = currentDataJSON;
      update();
    }
  }

  setInterval(checkUpdate, 100);
}


