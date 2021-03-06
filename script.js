$('document').ready(function () {
    // Instance the tour
    const tour = new Tour({
        steps: [
            {
                element: "#harga",
                title: "Silahkan input harga",
                content: "contoh : 1000",
                placement: "bottom",
                backdrop: true,
                backdropPadding: 30,
                template:
                    `<div class='popover tour'>
                <div class='arrow'></div>
                <h3 class='popover-title'></h3>
                <div class='popover-content'></div>
                <div class='popover-navigation'>
                  <button class='btn btn-success' data-role='next'>Next »</button>
                    </div>
              </div>`
            },
            {
                element: "#lot",
                title: "Lalu input jumlah Lot",
                content: "contoh : 10",
                placement: "bottom",
                backdrop: true,
                backdropPadding: 30,
                template: `<div class='popover tour'>
                <div class='arrow'></div>
                <h3 class='popover-title'></h3>
                <div class='popover-content'></div>
                <div class='popover-navigation'>
                  <button class='btn btn-default' data-role='prev'>« Prev</button>
                  <span data-role='separator'></span>
                  <button class='btn btn-success' data-role='next'>Next »</button>
                    </div>
              </div>`
            },
            {
                element: "#total",
                content: "ini jumlah yang harus dibayar ketika kondisi Beli",
                placement: "bottom",
                backdrop: true,
                reflex: true,
                backdropPadding: 35,
                template: `<div class='popover tour'>
                <div class='arrow'></div>
                <div class='popover-content'></div>
                <div class='popover-navigation'>
                  <button class='btn btn-default' data-role='prev'>« Prev</button>
                  <span data-role='separator'></span>
                  <button class='btn btn-success' data-role='next'>Next »</button>
                    </div>
              </div>`
            },
            {
                element: ".toggle",
                content: "atur kondisi Beli atau Jual",
                placement: "bottom",
                backdrop: true,
                backdropPadding: 30,
                template: `<div class='popover tour'>
                <div class='arrow'></div>
                <div class='popover-content'></div>
                <div class='popover-navigation'>
                  <button class='btn btn-default' data-role='end'>Siap !</button>
                    </div>
              </div>`
            }
        ]
    });

    // Initialize the tour
    tour.init();

    // Start the tour
    tour.start();
    const
        harga = $('#harga'),
        lot = $('#lot'),
        brokerFee = $('#brokerFee'),
        levy = $('#levy'),
        pph = $('#pph'),
        ppn = $('#ppn'),
        totalBiaya = $('#totalBiaya'),
        totalHargaSaham = $('#totalHargaSaham'),
        total = $('#total'),
        labelTotal = $('.labelTotal'),
        fee_broker = 0.001, // 0,1%
        fee_levy = 0.00043, // 0,043%
        fee_ppn = 0.1, // 10%
        fee_pph = 0.001; // 0,1%


    let
        int_harga = 0,
        int_lot = 0,
        int_broker = 0,
        int_levy = 0,
        int_ppn = 0,
        int_pph = 0,
        int_totalHarga = 0;



    hidePph();

    // input filter only number
    harga.inputFilter(function (value) {
        return /^\d*\.?\d*$/.test(value); // Allow digits and '.' only, using a Regex
    });

    lot.inputFilter(function (value) {
        return /^\d*\.?\d*$/.test(value); // Allow digits and '.' only, using a Regex
    });
    // end input filter only number

    harga.on(
        "keyup",
        debounce(function (e) {
            e.target.value = formatRupiah(e.target.value);
            int_harga = int(harga.val());
            if (int(e.target.value) < 50) {
                e.target.value = 50;
                int_harga = 50;
                hitung();
            }
            if (harga.val() !== "" && lot.val() !== "") {
                // jalankan perhitungan
                int_totalHarga = (int_harga * int_lot);
                hitung()
            } else {
                reset();
            }
        }, 800)
    );

    lot.on(
        "keyup",
        debounce(function (e) {
            e.target.value = formatRupiah(e.target.value);
            int_lot = (int(lot.val()) * 100);
            if (harga.val() !== "" && lot.val() !== "") {
                // jalankan perhitungan
                int_totalHarga = (int_harga * int_lot);
                hitung();
            } else {
                reset();
            }
        }, 800)
    );


    // handle switch JUAL / BELI
    $('#jubel').change(function () {
        const btn = $('#jubel').prop('checked');
        if (btn === true) {
            // jika sedang posisi BELI
            hidePph();
            pph.val('0');
            hitung();
        } else {
            // jika sedang posisi JUAL
            showPph();
            changePPH();
            hitung();
        }
    })

    function changeBrokerFee() {
        int_broker = Math.round(int_totalHarga * fee_broker);
        let res = formatRupiah(int_broker.toString());
        brokerFee.val(res);
    }

    function changeLevy() {
        int_levy = Math.round(int_totalHarga * fee_levy);
        int_levy -= Math.round(int_levy * fee_ppn);
        let res = formatRupiah(int_levy.toString());
        levy.val(res);
    }

    function changePPN() {
        int_ppn = Math.round((int_broker + int_levy) * fee_ppn);
        let res = formatRupiah(int_ppn.toString());
        ppn.val(res);
    }

    function changeTotalHargaSaham() {
        let res = formatRupiah(int_totalHarga.toString());
        totalHargaSaham.val(res);
    }

    function changeTotalBiaya() {
        let subTotal = (int_broker + int_levy + int_ppn);
        // jika JUAL maka tambahkan PPH
        const btn = $('#jubel').prop('checked');
        if (btn === false) {
            subTotal += int_pph;
        }
        let res = formatRupiah(subTotal.toString());
        totalBiaya.val(res);
    }


    function changePPH() {
        int_pph = Math.round(int_totalHarga * fee_pph);
        let res = formatRupiah(int_pph.toString());
        pph.val(res);
    }

    function changeTotal() {
        let tot = Math.round(int_broker + int_levy + int_ppn);

        // jika JUAL maka tambahkan PPH & kurangi harga saham dgn total biaya
        const btn = $('#jubel').prop('checked');
        if (btn === false) {
            tot += Math.round(int_totalHarga * fee_pph); // PPH
            tot = Math.round(int_totalHarga - tot); //kurangi dgn biaya
            labelTotal.text('Total (setelah dipotong biaya)');
        } else {
            tot += int_totalHarga;
            labelTotal.text('Total');
        }
        let res = formatRupiah(tot.toString());
        total.val('Rp. ' + res);
    }

    function hitung() {
        changeBrokerFee();
        changeLevy();
        changePPN();
        changeTotalBiaya();
        changeTotalHargaSaham();
        changeTotal();
        if ($('#jubel').prop('checked') === false) {
            changePPH();
        }
    }

    function reset() {
        brokerFee.val('0');
        levy.val('0');
        pph.val('0');
        ppn.val('0');
        totalHargaSaham.val('0');
        totalBiaya.val('0');
        total.val('Rp. 0');
    }

    function showPph() {
        $('.pphFinal').show();
        $('.totalBiaya').removeClass('offset-md-3')
    }

    function hidePph() {
        $('.pphFinal').hide();
        $('.totalBiaya').addClass('offset-md-3')
    }


});



// mengubah format ke integer
function int(data) {
    // menghilangkan . pada nominal
    let int = parseInt(data.replace(".", ""));
    return int;
}


(function ($) {
    $.fn.inputFilter = function (inputFilter) {
        return this.on("input keyup keydown mousedown mouseup select contextmenu drop", function () {
            if (inputFilter(this.value)) {
                this.oldValue = this.value;
                this.oldSelectionStart = this.selectionStart;
                this.oldSelectionEnd = this.selectionEnd;
            } else if (this.hasOwnProperty("oldValue")) {
                this.value = this.oldValue;
                this.setSelectionRange(this.oldSelectionStart, this.oldSelectionEnd);
            } else {
                this.value = "";
            }
        });
    };
}(jQuery));



function formatRupiah(angka) {
    let number_string = angka.replace(/[^,\d]/g, '').toString(),
        split = number_string.split(','),
        sisa = split[0].length % 3,
        rupiah = split[0].substr(0, sisa),
        ribuan = split[0].substr(sisa).match(/\d{3}/gi);

    // tambahkan titik jika yang di input sudah menjadi angka ribuan
    if (ribuan) {
        separator = sisa ? '.' : '';
        rupiah += separator + ribuan.join('.');
    }

    rupiah = split[1] != undefined ? rupiah + ',' + split[1] : rupiah;
    return rupiah;
}

const debounce = (fn, delay) => {
    let timeoutID;

    return function (...args) {
        if (timeoutID) {
            clearTimeout(timeoutID);
        }
        timeoutID = setTimeout(() => {
            fn(...args);
        }, delay);
    };
};
