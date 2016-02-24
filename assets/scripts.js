// Document ready
document.addEventListener("DOMContentLoaded", function(event) {
    /* Pomocne funkce START -------------------------------------------------------------------------------- */

    // Podpora pro AJAX ajax.post() a ajax.get()
    var ajax = {};
    ajax.x = function() {
        if (typeof XMLHttpRequest !== 'undefined') {
            return new XMLHttpRequest();
        }
        var versions = [
            "MSXML2.XmlHttp.6.0",
            "MSXML2.XmlHttp.5.0",
            "MSXML2.XmlHttp.4.0",
            "MSXML2.XmlHttp.3.0",
            "MSXML2.XmlHttp.2.0",
            "Microsoft.XmlHttp"
        ];

        var xhr;

        for(var i = 0; i < versions.length; i++) {
            try {
                xhr = new ActiveXObject(versions[i]);
                break;
            } catch (e) {
            }
        }
        return xhr;
    };

    ajax.send = function(url, callback, method, data, sync) {
        var x = ajax.x();
        x.open(method, url, sync);
        x.onreadystatechange = function() {
            if (x.readyState == 4) {
                callback(JSON.parse(x.responseText))
            }
        };
        if (method == 'POST') {
            x.setRequestHeader('Content-type', 'application/x-www-form-urlencoded');
        }
        x.send(data)
    };

    ajax.get = function(url, data, callback, sync) {
        var query = [];
        for (var key in data) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        ajax.send(url + (query.length ? '?' + query.join('&') : ''), callback, 'GET', null, sync)
    };

    ajax.post = function(url, data, callback, sync) {
        var query = [];
        for (var key in data) {
            query.push(encodeURIComponent(key) + '=' + encodeURIComponent(data[key]));
        }
        ajax.send(url, callback, 'POST', query.join('&'), sync)
    };

    // querySelector pro IE 8
    if (!document.querySelector) {
        document.querySelector = function(selector) {
            var head = document.documentElement.firstChild;
            var styleTag = document.createElement("STYLE");
            head.appendChild(styleTag);
            document.__qsResult = [];

            styleTag.styleSheet.cssText = selector + "{x:expression(document.__qsResult.push(this))}";
            window.scrollBy(0, 0);
            head.removeChild(styleTag);

            var result = [];
            for (var i in document.__qsResult)
                result.push(document.__qsResult[i]);
            return result;
        }
    }

    // Prace s class
    Element.prototype.hasClass = function(className) {
        return new RegExp(' ' + className + ' ').test(' ' + this.className + ' ');
    };


    Element.prototype.addClass = function(className) {
        if (!this.hasClass(className)) {
            this.className += ' ' + className;
        }

        return this;
    };

    Element.prototype.removeClass = function(className) {
        var newClass = ' ' + this.className.replace(/[\t\r\n]/g, ' ') + ' '
        if (this.hasClass(className)) {
            while (newClass.indexOf( ' ' + className + ' ') >= 0) {
                newClass = newClass.replace(' ' + className + ' ', ' ');
            }
            this.className = newClass.replace(/^\s+|\s+$/g, ' ');
        }

        return this;
    };

    Element.prototype.toggleClass = function(className) {
        var newClass = ' ' + this.className.replace(/[\t\r\n]/g, " ") + ' ';
        if (this.hasClass(className)) {
            while (newClass.indexOf(" " + className + " ") >= 0) {
                newClass = newClass.replace(" " + className + " ", " ");
            }
            this.className = newClass.replace(/^\s+|\s+$/g, ' ');
        } else {
            this.className += ' ' + className;
        }

        return this;
    };

    // Prace s atributem data-...
    Element.prototype.data = function(attrName, value) {
        if (typeof(value) === "undefined") {
            return this.getAttribute('data-' + attrName);
        } else {
            this.setAttribute('data-' + attrName, value);
            return this;
        }
    };

    // Price s pozici elementu
    Element.prototype.offset = function() {
        var top = 0, left = 0, element = this;
        do {
            top += element.offsetTop  || 0;
            left += element.offsetLeft || 0;
            element = element.offsetParent;
        } while(element);

        return {
            top: top,
            left: left
        };
    };

    // Prace s obsahem elementu - metody text() a html()
    Element.prototype.text = function(value) {
        if (typeof(value) === "undefined") {
            return this.textContent;
        } else {
            this.textContent = value;
            return this;
        }
    };

    Element.prototype.html = function(value) {
        if (typeof(value) === "undefined") {
            return this.innerHTML;
        } else {
            this.innerHTML = value;
            return this;
        }
    };

    /* Pomocne funkce END -------------------------------------------------------------------------------- */

    // Nastavi focus pro element predany v parametru
    function setSearchFocus(elem)
    {
        elem.focus();
    }

    // Rozbalovani vyhledavani
    var find_btn = document.getElementById("find-btn");

    if (find_btn) {
        find_btn.onclick = function(e) {
            var find_form = document.getElementById("find");
            var find_input = document.getElementById("find-input");

            if (find_form && find_input) {
                if (find_form.hasClass("open")) {
                    // Formular uz je rozbaleny, odeslu jej
                    return true;
                } else {
                    // Formular je zabaleny, rozbalim jej
                    find_form.addClass("open");
                    //find_input.focus();

                    // Pri primem zavolani focus() zde to nefungovalo v Safari, proto tento "hack"
                    window.setTimeout(function() {
                        setSearchFocus(find_input);
                    }, 100)

                    return false;
                }
            }
        }
    }

    document.documentElement.onclick = function(e) {
        var evt = e || window.event;
        var target = evt.target || evt.srcElement;

        // Zabalovani vyhledavani pri kliku kamkoliv mimo formular
        if ('find' !== target.id && 'find-btn' !== target.id && 'find-input' !== target.id) {
            var find_form = document.getElementById("find");

            if (find_form) {
                find_form.removeClass("open");
            }
        }

        // Zabalovani podmenu kategorii pri kliko mimo menu
        if (!target.hasClass("nc")) {
            var categories = document.getElementsByClassName("categories-open");

            for (var i=0; i<categories.length; i++) {
                categories[i].removeClass("categories-open");
            }
        }

        // Zabalovani volice poradi na vypisu produktu
        if (!target.hasClass("sorter-option") && !target.hasClass("sorter-options") && !target.hasClass("sorter-value")) {
            var sorter = document.getElementById("sorter-1");

            if (sorter) {
                sorter.removeClass("open");
            }
        }
    }

    // Hamburger
    var nav_icon = document.getElementById("nav-icon");

    if (nav_icon) {
        nav_icon.appendChild(document.createElement("span"));
        nav_icon.appendChild(document.createElement("span"));
        nav_icon.appendChild(document.createElement("span"));
        nav_icon.appendChild(document.createElement("span"));

        nav_icon.onclick = function(e) {
            var body = document.getElementsByTagName("body");
            body[0].toggleClass("show-menu");
        }
    }

    // rozbalovani menu kategorii
    var categories = document.getElementsByClassName("nav-category");

    for (var i=0; i<categories.length; i++) {
        categories[i].onclick = function(e) {
            if ("1" == this.data("subcategories")) {
                var li = this.parentNode;

                if (li.hasClass("categories-open")) {
                    li.removeClass("categories-open");
                } else {
                    // zavreni vsech ostatnich kategorii
                    var li_categories = document.getElementsByClassName("nav-li-category");

                    for (var j=0; j<li_categories.length; j++) {
                        li_categories[j].removeClass("categories-open");
                    }

                    // otevreni jedne konkretni kategorie
                    li.addClass("categories-open");
                }

                return false;
            } else {
                return true;
            }
        }
    }

    // Rozbalovani zpusobu razeni produktu
    var sorter_value = document.getElementById("sorter-value");

    if (sorter_value) {
        sorter_value.onclick = function(e) {
            var sorter = document.getElementById("sorter-1");

            if (sorter) {
                sorter.toggleClass("open");
            }
        }
    }

    // Zmena poctu produktu (na 4) v jednom radku na vypisu produktu
    var cols_switch = document.getElementsByClassName("cols-switch");

    for (var i=0; i<cols_switch.length; i++) {
        cols_switch[i].onclick = function(e) {
            if (!this.hasClass("active")) {
                // deaktivace vsech ostatnich typu
                for (var j=0; j<cols_switch.length; j++) {
                    cols_switch[j].removeClass("active");
                }

                this.addClass("active");

                var collection_list = document.getElementById("collection-list");

                if (collection_list) {
                    collection_list.className = collection_list.className.replace(/cols-[0-9]+/, '');
                    collection_list.className += " " + this.data("class");
                }

                var links = collection_list.childNodes;

                if (links.length) {
                    var last;

                    for (var j=0; j<links.length; j++) {
                        if ("A" == links[j].tagName) {
                            if (links[j].hasClass("hidden") && last >= 0) {
                                if ("cols-3" == this.data("class")) {
                                    links[last].addClass("hidden");
                                } else if ("cols-4" == this.data("class")) {
                                    links[j].removeClass("hidden");
                                }

                                break;
                            }

                            last = j;
                        }
                    }
                }
            }
        }
    }

    // Nacitani dalsich produktu (strankovani)
    var more_products = document.getElementById("more-products");
    var collection_list = document.getElementById("collection-list");

    if (more_products && collection_list) {
        more_products.onclick = function(e) {
            if (collection_list.hasClass("cols-3")) {
                var product_per_page = 3 * this.data("rows_per_page");
            } else {
                var product_per_page = 4 * this.data("rows_per_page");
            }

            

            var links = collection_list.childNodes;

            if (links.length) {
                var count = 0;

                for (var j=0; j<links.length; j++) {
                    if ("A" == links[j].tagName) {
                        if (links[j].hasClass("hidden")) {
                            count++;
                            links[j].removeClass("hidden");

                            if (count >= product_per_page && !collection_list.hasClass("featured")) {
                                break;
                            }
                        }

                        if (collection_list.hasClass("featured")) {
                            links[j].setAttribute("style", "display: block");
                        }
                    }
                }

                // nema se tlacitko pro zobrazeni dalsich produktu skryt?
                var hide_btn = true;

                for (var j=0; j<links.length; j++) {
                    if ("A" == links[j].tagName) {
                        if (links[j].hasClass("hidden")) {
                            hide_btn = false;
                        }
                    }
                }

                if (hide_btn || collection_list.hasClass("featured")) {
                    document.getElementById("more-products-wrap").addClass("hidden");
                }
            }
        }
    }

    // Zmena velke fotky v detailu produktu
    var thumb_image = document.getElementsByClassName("thumb-image");

    for (var i=0; i<thumb_image.length; i++) {
        thumb_image[i].onclick = function(e) {
            for (var j=0; j<thumb_image.length; j++) {
                thumb_image[j].removeClass("active");
            }

            this.addClass("active");

            document.getElementById("big-image").setAttribute("style", "background-image: url('" + this.getAttribute("href") + "')");
            document.getElementById("big-image").data("src", this.getAttribute("href"));

            if (window.gallery_swipe) {
                var index = this.data("index");
                window.gallery_swipe.slide(index, 400);
            }

            return false;
        }
    }

    // Prohozeni prvni fotky za druhou na vypisu produktu
    [].forEach.call(document.querySelectorAll(".product-box"), function(elem,i,a) {
        elem.onmouseover = function(e) {
            [].forEach.call(elem.querySelectorAll("span.img span.i"), function(elem2,i2,a2) {
                if (elem2.hasClass("first")) {
                    elem2.addClass("hide");
                }

                if (elem2.hasClass("second")) {
                    elem2.addClass("show");
                }
            });
        }

        elem.onmouseout = function(e) {
            [].forEach.call(elem.querySelectorAll("span.img span.i"), function(elem2,i2,a2) {
                if (elem2.hasClass("first")) {
                    elem2.removeClass("hide");
                }

                if (elem2.hasClass("second")) {
                    elem2.removeClass("show");
                }
            });
        }
    });

    // Taby - zmena tabu po kliku na nazev tabu
    [].forEach.call(document.querySelectorAll(".tabs .tab-labels span"), function(elem,i,a) {
        elem.onclick = function(e) {
            [].forEach.call(document.querySelectorAll(".tabs .tab-slides .slide"), function(elem2,i,a) {
                elem2.removeClass("active");
            });

            var slide = document.getElementById("tab-slide-" + this.data("id"));

            if (slide) {
                slide.addClass("active");
            }

            [].forEach.call(document.querySelectorAll(".tabs .tab-labels span"), function(elem2,i,a) {
                elem2.removeClass("active");
            });

            this.addClass("active");
        }
    });

    // Spinner
    [].forEach.call(document.querySelectorAll(".spinner .btn"), function(elem,i,a) {
        elem.onclick = function(e) {
            var id = this.data('id');
            var input = document.getElementById("updates_" + id);

            if (input) {
                var plus_minus = 1;

                if (this.hasClass("minus")) {
                    plus_minus = -1;
                }

                var val = parseInt(input.value);

                if (isNaN(val)) {
                    val = 1;
                }

                val += plus_minus;

                if (val < 1) {
                    val = 1;
                }

                if (val > 999) {
                    val = 999;
                }

                input.value = val;
            }
        }
    });

    // Rozbaleni soc. sdileni na mobilu
    var social_sharing_btn = document.getElementById("social_sharing_btn");

    if (social_sharing_btn) {
        social_sharing_btn.onclick = function(e) {
            var detail_socials = document.getElementsByClassName("detail-socials");

            if (detail_socials && detail_socials[0]) {
                detail_socials[0].toggleClass("open");
            }
        }
    }

    // Fce odebere classu u hlavniho obrazku v detailu produktu - vyuziva se u animace pro vlozeni prodktu do kosiku
    function bigImageRemoveAnimate()
    {
        var big_image = document.getElementById("big-image");

        if (big_image) {
            big_image.removeClass("animate");
        }
    }

    // Zobrazeni produktoveho boxu nad tlacitkem kosiku
    function showQuickCartProduct()
    {
        var quick_cart_product = document.getElementById("quick-cart-product-" + document.getElementById("productSelect").value);

        quick_cart_product.style.opacity = 1;
    }

    // Skryti (smazani) animovaneho objektu, ktery prijede k produktovemu boxu nad tlacitkem kosiku
    function hideQuickCartProductAnimated()
    {
        var quick_cart_product = document.getElementById("quick-cart-product-animated");
        document.body.removeChild(quick_cart_product);

        // Ajaxove pridani produktu do kosiku - schvalne se vola az zde, protoze v prubehu animace pridavani produktu do kosiku se pak animace vykreslovala hodne trhane
        ajaxAddProductToCart();
    }

    // Pridani produktoveho boxu do kosiku
    function addProductBox()
    {
        var quick_cart = document.getElementById("quick-cart");
        var big_image = document.getElementById("big-image");
        var variant_id = document.getElementById("productSelect").value;
        var quick_cart_product = document.getElementById("quick-cart-product-" + variant_id);

        if (quick_cart && big_image) {
            if (!quick_cart_product) {
                // Produktovy box nad tlacitkem kosiku
                var div1 = document.createElement("div");
                div1.addClass("quick-cart-product quick-cart-product-static");
                div1.setAttribute("id", "quick-cart-product-" + variant_id);
                div1.style.opacity = 0;

                var div2 = document.createElement("div");
                div1.appendChild(div2);

                var img = document.createElement("img");
                img.setAttribute("src", big_image.data("src"));
                div2.appendChild(img);

                var span1 = document.createElement("span");
                span1.addClass("s1");

                // Dohledani aktualni ceny
                span1.html(document.getElementById("price-preview").html());
                div2.appendChild(span1);

                var span2 = document.createElement("span");
                span2.addClass("s2");

                // dohledani aktivni velikosti
                var swatches = document.querySelectorAll(".swatches .swatch");

                if (swatches[0]) {
                    var inputs = swatches[0].querySelectorAll("input");

                    for (var i=0; i < inputs.length; i++) {
                        if (inputs[i].checked) {
                            span2.text(inputs[i].value);
                            break;
                        }
                    }
                }

                div2.appendChild(span2);

                var span3 = document.createElement("span");
                span3.addClass("count hide");
                span3.setAttribute("id", "quick-cart-product-count-" + variant_id);
                span3.text(0);
                div1.appendChild(span3);

                var span4 = document.createElement("span");
                span4.addClass("quick-cart-product-remove remove");
                span4.setAttribute("data-id", variant_id);
                span4.onclick = product_remove_function;
                div1.appendChild(span4);

                var span5 = document.createElement("span");
                span5.addClass("quick-cart-product-removeall removeall");
                span5.setAttribute("data-id", variant_id);
                span5.text("Delete all");
                span5.onclick = product_removeall_function;
                div1.appendChild(span5);

                quick_cart.insertBefore(div1, quick_cart.firstChild);

                window.setTimeout(showQuickCartProduct, 1000);
            }

            // Animace pridani produktu k produktovemu boxu
            var div1 = document.createElement("div");
            div1.addClass("quick-cart-product animated");
            div1.setAttribute("id", "quick-cart-product-animated");

            var offset = big_image.offset();
            div1.style.left = offset.left + 1 + "px"; // uprava pozice kvuli absenci ramecku
            div1.style.top = offset.top + 1 + "px";

            var div2 = document.createElement("div");

            div2.style.width = big_image.offsetWidth - 2 + "px";  // uprava rozmeru kvuli absenci ramecku
            //div2.style.height = big_image.offsetHeight - 2 + "px";
            div2.style.height = Math.round(parseInt(div2.style.width) * 1.33) + "px";
            div1.appendChild(div2);

            var img = document.createElement("img");
            img.setAttribute("src", big_image.data("src"));
            div2.appendChild(img);

            var span1 = document.createElement("span");
            span1.addClass("s1");
            div2.appendChild(span1);

            var span2 = document.createElement("span");
            span2.addClass("s2");
            div2.appendChild(span2);

            document.body.appendChild(div1);

            // Vypocet cilove pozice animace
            var quick_cart_products = document.getElementsByClassName("quick-cart-product-static");
            var quick_cart_products_count = quick_cart_products.length;  // vysledna pozice zavisi na poctu vlozenych produktu do kosiku
            var product_box_index = quick_cart_products_count;

            if (quick_cart_product) {
                // produkt uz je v kosiku
                for (var i =0; i < quick_cart_products_count; i++) {
                    if ("quick-cart-product-" + variant_id == quick_cart_products[i].getAttribute("id")) {
                        product_box_index = quick_cart_products_count - i;
                    }
                }
            }

            var window_w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;  // kosik je fixovany v pravem spodnim rohu = souradnice je zavisla na velikost okna prohlizece
            var window_h = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;

            // Cilove souradnice
            if (window_w > 600) {
                // animace pro desktop
                var target_coords_x = parseInt(window_w) - 85 - parseInt(div1.style.left) + 1;
                var target_coords_y = parseInt(window_h) - 80 - (66 * product_box_index) - parseInt(div1.style.top) + 1;
            } else {
                // animace pro mobil
                var target_coords_x = parseInt(window_w) - 85 - parseInt(div1.style.left) + 1;
                var target_coords_y = parseInt(window_h) - 80 - parseInt(div1.style.top) + 1;
            }

            // Pricteni k Y vysku odscrollovani
            var supportPageOffset = window.pageXOffset !== undefined;
            var isCSS1Compat = ((document.compatMode || "") === "CSS1Compat");
            //var scrollx = supportPageOffset ? window.pageXOffset : isCSS1Compat ? document.documentElement.scrollLeft : document.body.scrollLeft;
            var scrollY = supportPageOffset ? window.pageYOffset : isCSS1Compat ? document.documentElement.scrollTop : document.body.scrollTop;

            target_coords_y += scrollY;

            // Souradnice, kterymi to projede
            var through_coords_x = parseInt(div1.style.left) - parseInt(div2.style.width) * 1.4;
            var through_coords_y = target_coords_y - parseInt(div2.style.height)/3;

            // Spusteni CSS animace zmenseni / zakulaceni
            div1.addClass("run");

            // Spusteni animace trajektorie
            var trajectory = [
                {x:through_coords_x, y:through_coords_y},
                {x:target_coords_x, y:target_coords_y}
            ];
            TweenMax.to(div1, 1, {bezier:{type:"soft", values:trajectory}, ease:Power1.easeInOut});

            // Skryti animovaneho objektu
            window.setTimeout(hideQuickCartProductAnimated, 1000);
        }
    }

    // Ajaxove pridani produktu do kosiku
    function ajaxAddProductToCart()
    {
        var variant_id = parseInt(document.getElementById("productSelect").value);
        var product_id = parseInt(document.getElementById("product_id").value);
        var count = parseInt(document.getElementById("updates_" + product_id).value);

        if (count < 0) {
            count = 1;
        }

        var product_box = document.getElementById("quick-cart-product-" + variant_id);

        if (product_box) {
            product_box.removeClass("show-remove-all");
            last_removed_variant_count = 0;
        }

        // pridani produktu do kosiku
        ajax.post("/cart/add.js", {quantity: count, id: variant_id}, function() {
            // aktualizace celkove ceny
            ajax.get("/cart.js", {}, function(response) {
                document.getElementById("quick-cart-price").text(Shopify.formatMoney(response.total_price));

                // aktualizace poctu ks
                var product_count_box = document.getElementById("quick-cart-product-count-" + variant_id);
                var product_count = parseInt(product_count_box.text());
                product_count += count;
                product_count_box.text(product_count);

                if (product_count > 1) {
                    product_count_box.removeClass("hide");
                }

                // aktualizace celkoveho poctu ks pro mobilni vzhled
                var quick_cart_pay_total_count = document.getElementById("quick-cart-pay-total-count");
                var quick_cart_pay_total_count_value = parseInt(quick_cart_pay_total_count.text());
                quick_cart_pay_total_count_value += count;
                quick_cart_pay_total_count.text(quick_cart_pay_total_count_value);
                
            });
        });
    }

    // Vlozeni produktu do kosiku
    var add_to_cart_btn = document.getElementById("AddToCart");

    if (add_to_cart_btn) {
        add_to_cart_btn.onclick = function(e) {
            this.blur();

            var quick_cart_pay = document.getElementById("quick-cart-pay");

            // Prijeti modreho spodniho tlacitka s celkovou cenou, pokud jeste neni vyjete
            if (quick_cart_pay) {
                quick_cart_pay.addClass("open");
            }

            // Pridani produktoveho boxu do kosiku
            addProductBox();

            // Animace velke fotky produktu
            var big_image = document.getElementById("big-image");

            if (big_image) {
                big_image.addClass("animate");
                window.setTimeout(bigImageRemoveAnimate, 400);
            }

            return false;
        }
    }

    // Odebere produkt z kosiku z DOMu (po skonceni animace)
    function removeProduct(quick_cart, product_box)
    {
        quick_cart.removeChild(product_box);
    }

    // Globalni promenne, ktere zajistuji zobrazeni tlacitka na odebrani vsech ks produktu pote, co odeberu 3 ks toho sameho produktu
    var last_removed_variant;
    var last_removed_variant_count;

    // Odebrani produktu z kosiku
    var product_remove_function = function(e) {
        var variant_id = this.data("id");

        var product_box = document.getElementById("quick-cart-product-" + variant_id);
        var product_count_box = document.getElementById("quick-cart-product-count-" + variant_id);
        var quick_cart = document.getElementById("quick-cart");
        var quick_cart_pay = document.getElementById("quick-cart-pay");
        var count = parseInt(product_count_box.text());

        if (product_box && quick_cart) {
            count--;

            if (count <= 0) {
                product_box.addClass("remove-product");
                window.setTimeout(function() {
                    removeProduct(quick_cart, product_box);
                }, 1000)
            } else {
                product_count_box.text(count);

                if (count <= 1) {
                    product_count_box.addClass("hide");
                }
            }

            if (last_removed_variant == variant_id) {
                last_removed_variant_count++;
            } else {
                last_removed_variant = variant_id;
                last_removed_variant_count = 1;
            }

            if (3 == last_removed_variant_count && count > 1) {
                product_box.addClass("show-remove-all");
            }

            ajax.get("/cart/change.js", {quantity: count, id: variant_id}, function(response) {
                ajax.get("/cart.js", {}, function(response) {
                    document.getElementById("quick-cart-price").text(Shopify.formatMoney(response.total_price));

                    // Zobrazeni tlacitka na nakup
                    if (response.total_price <= 0) {
                        quick_cart_pay.removeClass("open");
                    }
                });
            });
        }
    };

    // Odebrani produktu z kosiku
    [].forEach.call(document.querySelectorAll(".quick-cart-product-remove"), function(elem,i,a) {
        elem.onclick = product_remove_function;
    });

    // Odebrani vsech ks produktu z kosiku
    var product_removeall_function = function(e) {
        var variant_id = this.data("id");

        var product_box = document.getElementById("quick-cart-product-" + variant_id);
        var product_count_box = document.getElementById("quick-cart-product-count-" + variant_id);
        var quick_cart = document.getElementById("quick-cart");
        var quick_cart_pay = document.getElementById("quick-cart-pay");

        if (product_box && quick_cart) {

            product_box.addClass("remove-product");
            window.setTimeout(function() {
                removeProduct(quick_cart, product_box);
            }, 200)

            ajax.get("/cart/change.js", {quantity: 0, id: variant_id}, function(response) {
                ajax.get("/cart.js", {}, function(response) {
                    document.getElementById("quick-cart-price").text(Shopify.formatMoney(response.total_price));

                    // Zobrazeni tlacitka na nakup
                    if (response.total_price <= 0) {
                        quick_cart_pay.removeClass("open");
                    }
                });
            });
        }
    };

    // Odebrani vsech ks produktu z kosiku
    [].forEach.call(document.querySelectorAll(".quick-cart-product-removeall"), function(elem,i,a) {
        elem.onclick = product_removeall_function;
    });

    // Prechod do objednavky - na desktopu to jde rovnou do objednavky, na mobilu do kosiku
    function setPayButtonAction()
    {
        var quick_cart_pay = document.getElementById("quick-cart-pay");

        if (quick_cart_pay) {
            var window_w = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;  // kosik je fixovany v pravem spodnim rohu = souradnice je zavisla na velikost okna prohlizece

            if (window_w > 600) {
                quick_cart_pay.setAttribute("href", "/checkout");
                quick_cart_pay.removeClass("cart-ico");
            } else {
                quick_cart_pay.setAttribute("href", "/cart");
                quick_cart_pay.addClass("cart-ico");
            }
        }
    }
    window.onresize = function(event) {
        setPayButtonAction();
    };
    setPayButtonAction();

    // zobrazeni popupu na prihlaseni
    var customer_login_link = document.getElementById("customer_login_link");

    if (customer_login_link) {
        customer_login_link.onclick = function(e) {
            sign_in_popup = document.getElementById("sign-in-popup");

            if (sign_in_popup) {
                sign_in_popup.addClass("show");
            }

            return false;
        }
    }

    // zavreni popupu na prihlaseni
    var close_sign_in = document.getElementById("close-sign-in");

    if (close_sign_in) {
        close_sign_in.onclick = function(e) {
            sign_in_popup = document.getElementById("sign-in-popup");

            if (sign_in_popup) {
                sign_in_popup.removeClass("show");
            }
        }
    }

    // zobrazovani labelu, pokud input neni prazdny

    // obsluhuje labely pro inputy/textarey po udalosti blur
    function formLabelsBlur($this)
    {
        // najdu label
        var $label = $this.parent().find('label');

        if ($this.val()) {
            // formularovy prvek je neprazdny = label nebude pres formularovy prvek
            $label.addClass('filled');
        } else {
            // formularovy prvek je prazdny = label bude pres formularovy prvek
            $label.removeClass('filled');
        }
    }

    // obsluhuje labely pro inputy/textarey po udalosti focus nebo po kliku na label
    function formLabelsFocus($this)
    {
        // najdu label
        var $label = $this.parent().find('label');

        // label nebude pres formularovy prvek
        $label.addClass('filled');
    }

    // prvotni nacteni
    $('form .label input[type=email], form .label input[type=text], form .label input[type=password], form .label textarea').each(function() {
        formLabelsBlur($(this));
    });
    // udalosti
    $('form .label input[type=email], form .label input[type=text], form .label input[type=password], form .label textarea').on('blur', function() {
        formLabelsBlur($(this));
    });
    $('form .label input[type=email], form .label input[type=text], form .label input[type=password], form .label textarea, form .label label').on('click focus', function() {
        formLabelsFocus($(this));
    });

    // zobrazeni resetu hesla
    $("#toggle-reset-passw").click(function() {
        $(this).toggleClass("show");
        $("#reset-passw-form").toggleClass("show");
        return false;
    });

    // potvrzeni odberu newsletteru
    q = window.location.search.slice(1);

    if (q == "customer_posted=true"){
        var message = document.createElement("div");
        message.addClass("flash-message");

        var text_div = document.createElement("div");
        text_div.text('Your email has been successfully subscribed to the newsletter.');

        var close_span = document.createElement("span");
        close_span.setAttribute("id", "flash-message-close");
        text_div.appendChild(close_span);

        message.appendChild(text_div);

        document.body.appendChild(message);

        // nastaveni automatickeho zavreni
        window.setTimeout(function() {
            removeFlashMessage(message);
        }, 4000);
        
    }

    // animace zavreni flash message
    function removeFlashMessage(message)
    {
        message.addClass('remove');

        window.setTimeout(function() {
            document.body.removeChild(message);
        }, 400);
    }

    // zavreni flash message (napr. po pridani k odberu newsletteru) po kliknuti na krizek
    var close_flash_message = document.getElementById("flash-message-close");

    if (close_flash_message) {
        close_flash_message.onclick = function(e) {
            var message = this.parentNode.parentNode;
            removeFlashMessage(message);
        }
    }

    // validace
    $('#customer_login').validate({
        errorClass:'error',
        validClass:'success',
        errorElement: 'span',
        highlight: function (element, errorClass, validClass) {
            $(element).parents("div")
                      .addClass(errorClass)
                      .removeClass(validClass);

        },
        unhighlight: function (element, errorClass, validClass) {
            $(element).parents("." + errorClass)
                      .removeClass(errorClass)
                      .addClass(validClass);
        }
    });
});

/*
 * Swipe 2.0
 *
 * Brad Birdsall
 * Copyright 2013, MIT License
 *
*/

function Swipe(container, options) {

  "use strict";

  // utilities
  var noop = function() {}; // simple no operation function
  var offloadFn = function(fn) { setTimeout(fn || noop, 0) }; // offload a functions execution

  // check browser capabilities
  var browser = {
    addEventListener: !!window.addEventListener,
    touch: ('ontouchstart' in window) || window.DocumentTouch && document instanceof DocumentTouch,
    transitions: (function(temp) {
      var props = ['transitionProperty', 'WebkitTransition', 'MozTransition', 'OTransition', 'msTransition'];
      for ( var i in props ) if (temp.style[ props[i] ] !== undefined) return true;
      return false;
    })(document.createElement('swipe'))
  };

  // quit if no root element
  if (!container) return;
  var element = container.children[0];
  var slides, slidePos, width, length;
  options = options || {};
  var index = parseInt(options.startSlide, 10) || 0;
  var speed = options.speed || 300;
  options.continuous = options.continuous !== undefined ? options.continuous : true;

  function setup() {

    // cache slides
    slides = element.children;
    length = slides.length;

    // set continuous to false if only one slide
    if (slides.length < 2) options.continuous = false;

    //special case if two slides
    if (browser.transitions && options.continuous && slides.length < 3) {
      element.appendChild(slides[0].cloneNode(true));
      element.appendChild(element.children[1].cloneNode(true));
      slides = element.children;
    }

    // create an array to store current positions of each slide
    slidePos = new Array(slides.length);

    // determine width of each slide
    width = container.getBoundingClientRect().width || container.offsetWidth;

    element.style.width = (slides.length * width) + 'px';

    // stack elements
    var pos = slides.length;
    while(pos--) {

      var slide = slides[pos];

      slide.style.width = width + 'px';
      slide.setAttribute('data-index', pos);

      if (browser.transitions) {
        slide.style.left = (pos * -width) + 'px';
        move(pos, index > pos ? -width : (index < pos ? width : 0), 0);
      }

    }

    // reposition elements before and after index
    if (options.continuous && browser.transitions) {
      move(circle(index-1), -width, 0);
      move(circle(index+1), width, 0);
    }

    if (!browser.transitions) element.style.left = (index * -width) + 'px';

    container.style.visibility = 'visible';

  }

  function prev() {

    if (options.continuous) slide(index-1);
    else if (index) slide(index-1);

  }

  function next() {

    if (options.continuous) slide(index+1);
    else if (index < slides.length - 1) slide(index+1);

  }

  function circle(index) {

    // a simple positive modulo using slides.length
    return (slides.length + (index % slides.length)) % slides.length;

  }

  function slide(to, slideSpeed) {

    // do nothing if already on requested slide
    if (index == to) return;

    if (browser.transitions) {

      var direction = Math.abs(index-to) / (index-to); // 1: backward, -1: forward

      // get the actual position of the slide
      if (options.continuous) {
        var natural_direction = direction;
        direction = -slidePos[circle(to)] / width;

        // if going forward but to < index, use to = slides.length + to
        // if going backward but to > index, use to = -slides.length + to
        if (direction !== natural_direction) to =  -direction * slides.length + to;

      }

      var diff = Math.abs(index-to) - 1;

      // move all the slides between index and to in the right direction
      while (diff--) move( circle((to > index ? to : index) - diff - 1), width * direction, 0);

      to = circle(to);

      move(index, width * direction, slideSpeed || speed);
      move(to, 0, slideSpeed || speed);

      if (options.continuous) move(circle(to - direction), -(width * direction), 0); // we need to get the next in place

    } else {

      to = circle(to);
      animate(index * -width, to * -width, slideSpeed || speed);
      //no fallback for a circular continuous if the browser does not accept transitions
    }

    index = to;
    offloadFn(options.callback && options.callback(index, slides[index]));
  }

  function move(index, dist, speed) {

    translate(index, dist, speed);
    slidePos[index] = dist;

  }

  function translate(index, dist, speed) {

    var slide = slides[index];
    var style = slide && slide.style;

    if (!style) return;

    style.webkitTransitionDuration =
    style.MozTransitionDuration =
    style.msTransitionDuration =
    style.OTransitionDuration =
    style.transitionDuration = speed + 'ms';

    style.webkitTransform = 'translate(' + dist + 'px,0)' + 'translateZ(0)';
    style.msTransform =
    style.MozTransform =
    style.OTransform = 'translateX(' + dist + 'px)';

  }

  function animate(from, to, speed) {

    // if not an animation, just reposition
    if (!speed) {

      element.style.left = to + 'px';
      return;

    }

    var start = +new Date;

    var timer = setInterval(function() {

      var timeElap = +new Date - start;

      if (timeElap > speed) {

        element.style.left = to + 'px';

        if (delay) begin();

        options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);

        clearInterval(timer);
        return;

      }

      element.style.left = (( (to - from) * (Math.floor((timeElap / speed) * 100) / 100) ) + from) + 'px';

    }, 4);

  }

  // setup auto slideshow
  var delay = options.auto || 0;
  var interval;

  function begin() {

    interval = setTimeout(next, delay);

  }

  function stop() {

    delay = 0;
    clearTimeout(interval);

  }


  // setup initial vars
  var start = {};
  var delta = {};
  var isScrolling;

  // setup event capturing
  var events = {

    handleEvent: function(event) {

      switch (event.type) {
        case 'touchstart': this.start(event); break;
        case 'touchmove': this.move(event); break;
        case 'touchend': offloadFn(this.end(event)); break;
        case 'webkitTransitionEnd':
        case 'msTransitionEnd':
        case 'oTransitionEnd':
        case 'otransitionend':
        case 'transitionend': offloadFn(this.transitionEnd(event)); break;
        case 'resize': offloadFn(setup); break;
      }

      if (options.stopPropagation) event.stopPropagation();

    },
    start: function(event) {

      var touches = event.touches[0];

      // measure start values
      start = {

        // get initial touch coords
        x: touches.pageX,
        y: touches.pageY,

        // store time to determine touch duration
        time: +new Date

      };

      // used for testing first move event
      isScrolling = undefined;

      // reset delta and end measurements
      delta = {};

      // attach touchmove and touchend listeners
      element.addEventListener('touchmove', this, false);
      element.addEventListener('touchend', this, false);

    },
    move: function(event) {

      // ensure swiping with one touch and not pinching
      if ( event.touches.length > 1 || event.scale && event.scale !== 1) return

      if (options.disableScroll) event.preventDefault();

      var touches = event.touches[0];

      // measure change in x and y
      delta = {
        x: touches.pageX - start.x,
        y: touches.pageY - start.y
      }

      // determine if scrolling test has run - one time test
      if ( typeof isScrolling == 'undefined') {
        isScrolling = !!( isScrolling || Math.abs(delta.x) < Math.abs(delta.y) );
      }

      // if user is not trying to scroll vertically
      if (!isScrolling) {

        // prevent native scrolling
        event.preventDefault();

        // stop slideshow
        stop();

        // increase resistance if first or last slide
        if (options.continuous) { // we don't add resistance at the end

          translate(circle(index-1), delta.x + slidePos[circle(index-1)], 0);
          translate(index, delta.x + slidePos[index], 0);
          translate(circle(index+1), delta.x + slidePos[circle(index+1)], 0);

        } else {

          delta.x =
            delta.x /
              ( (!index && delta.x > 0               // if first slide and sliding left
                || index == slides.length - 1        // or if last slide and sliding right
                && delta.x < 0                       // and if sliding at all
              ) ?
              ( Math.abs(delta.x) / width + 1 )      // determine resistance level
              : 1 );                                 // no resistance if false

          // translate 1:1
          translate(index-1, delta.x + slidePos[index-1], 0);
          translate(index, delta.x + slidePos[index], 0);
          translate(index+1, delta.x + slidePos[index+1], 0);
        }

      }

    },
    end: function(event) {

      // measure duration
      var duration = +new Date - start.time;

      // determine if slide attempt triggers next/prev slide
      var isValidSlide =
            Number(duration) < 250               // if slide duration is less than 250ms
            && Math.abs(delta.x) > 20            // and if slide amt is greater than 20px
            || Math.abs(delta.x) > width/2;      // or if slide amt is greater than half the width

      // determine if slide attempt is past start and end
      var isPastBounds =
            !index && delta.x > 0                            // if first slide and slide amt is greater than 0
            || index == slides.length - 1 && delta.x < 0;    // or if last slide and slide amt is less than 0

      if (options.continuous) isPastBounds = false;

      // determine direction of swipe (true:right, false:left)
      var direction = delta.x < 0;

      // if not scrolling vertically
      if (!isScrolling) {

        if (isValidSlide && !isPastBounds) {

          if (direction) {

            if (options.continuous) { // we need to get the next in this direction in place

              move(circle(index-1), -width, 0);
              move(circle(index+2), width, 0);

            } else {
              move(index-1, -width, 0);
            }

            move(index, slidePos[index]-width, speed);
            move(circle(index+1), slidePos[circle(index+1)]-width, speed);
            index = circle(index+1);

          } else {
            if (options.continuous) { // we need to get the next in this direction in place

              move(circle(index+1), width, 0);
              move(circle(index-2), -width, 0);

            } else {
              move(index+1, width, 0);
            }

            move(index, slidePos[index]+width, speed);
            move(circle(index-1), slidePos[circle(index-1)]+width, speed);
            index = circle(index-1);

          }

          options.callback && options.callback(index, slides[index]);

        } else {

          if (options.continuous) {

            move(circle(index-1), -width, speed);
            move(index, 0, speed);
            move(circle(index+1), width, speed);

          } else {

            move(index-1, -width, speed);
            move(index, 0, speed);
            move(index+1, width, speed);
          }

        }

      }

      // kill touchmove and touchend event listeners until touchstart called again
      element.removeEventListener('touchmove', events, false)
      element.removeEventListener('touchend', events, false)

    },
    transitionEnd: function(event) {

      if (parseInt(event.target.getAttribute('data-index'), 10) == index) {

        if (delay) begin();

        options.transitionEnd && options.transitionEnd.call(event, index, slides[index]);

      }

    }

  }

  // trigger setup
  setup();

  // start auto slideshow if applicable
  if (delay) begin();


  // add event listeners
  if (browser.addEventListener) {

    // set touchstart event on element
    if (browser.touch) element.addEventListener('touchstart', events, false);

    if (browser.transitions) {
      element.addEventListener('webkitTransitionEnd', events, false);
      element.addEventListener('msTransitionEnd', events, false);
      element.addEventListener('oTransitionEnd', events, false);
      element.addEventListener('otransitionend', events, false);
      element.addEventListener('transitionend', events, false);
    }

    // set resize event on window
    window.addEventListener('resize', events, false);

  } else {

    window.onresize = function () { setup() }; // to play nice with old IE

  }

  // expose the Swipe API
  return {
    setup: function() {

      setup();

    },
    slide: function(to, speed) {

      // cancel slideshow
      stop();

      slide(to, speed);

    },
    prev: function() {

      // cancel slideshow
      stop();

      prev();

    },
    next: function() {

      // cancel slideshow
      stop();

      next();

    },
    stop: function() {

      // cancel slideshow
      stop();

    },
    getPos: function() {

      // return current index position
      return index;

    },
    getNumSlides: function() {

      // return total number of slides
      return length;
    },
    kill: function() {

      // cancel slideshow
      stop();

      // reset element
      element.style.width = '';
      element.style.left = '';

      // reset slides
      var pos = slides.length;
      while(pos--) {

        var slide = slides[pos];
        slide.style.width = '';
        slide.style.left = '';

        if (browser.transitions) translate(pos, 0, 0);

      }

      // removed event listeners
      if (browser.addEventListener) {

        // remove current event listeners
        element.removeEventListener('touchstart', events, false);
        element.removeEventListener('webkitTransitionEnd', events, false);
        element.removeEventListener('msTransitionEnd', events, false);
        element.removeEventListener('oTransitionEnd', events, false);
        element.removeEventListener('otransitionend', events, false);
        element.removeEventListener('transitionend', events, false);
        window.removeEventListener('resize', events, false);

      }
      else {

        window.onresize = null;

      }

    }
  }

}

if ( window.jQuery || window.Zepto ) {
  (function($) {
    $.fn.Swipe = function(params) {
      return this.each(function() {
        $(this).data('Swipe', new Swipe($(this)[0], params));
      });
    }
  })( window.jQuery || window.Zepto )

    window.gallery_swipe = new Swipe(document.getElementById('banner-gallery'), {
      speed: 400,
      transitionEnd: function(index, elem) {
        $('.thumbs .thumb-image').removeClass('active');
        $('.thumbs .thumb-image').eq(index).addClass('active');
      }
    });
}
