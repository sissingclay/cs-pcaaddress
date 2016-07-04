/**
 * Created by claysissing on 04/07/2016.
 */
/**
 * Created by claysissing on 28/06/2016.
 */

var csPcaAddress = Object.create(HTMLElement.prototype);

csPcaAddress.createdCallback = function () {

    this.getAttributes();
    this.pca_url = 'http://services.postcodeanywhere.co.uk/CapturePlus/Interactive/';
    this.pca_version = 'v2.10/json3ex.ws?';
    this.pca_country = 'http://services.postcodeanywhere.co.uk/Extras/Web/Ip2Country/v1.10/json3ex.ws';

    this.elements = {
        selectCountry: document.querySelector(this.selectCountry),
        findAddressBtn: document.querySelector('.js-cs-pca-findaddress'),
        pcaLongAddress: document.querySelector('.js-cs-pca-user'),
        foundPcaAddress: document.querySelector('.js-cs-pcaAddress'),
        optionSelect: document.querySelector('.js-cs-pcaAddressSelect')
    };

    this.watchCountrySelected();
    this.findIp2Country();
};

csPcaAddress.getAttributes = function () {
    this.selectCountry = this.getAttribute('country');
    this.pcaKey = this.getAttribute('pca-key');
};

csPcaAddress.watchCountrySelected = function () {

    var selectCountry = this.elements.selectCountry,
        iso;

    selectCountry.addEventListener('change', function () {
        iso = selectCountry.value;
        this.country = iso.toUpperCase();
    }.bind(this));
};

csPcaAddress.findIp2Country = function () {

    var url = this.pca_country + '?Key=' + encodeURIComponent(this.pcaKey);

    this.fetchData(url, this.setCountry.bind(this)).then(function () {
        this.findAddresses();
    }.bind(this));
};

csPcaAddress.setCountry = function (Items) {
    this.country = Items[0].Iso2;
};

csPcaAddress.findAddresses = function () {

    var findAddressBtn = this.elements.findAddressBtn,
        url = this.pca_url + 'Find/' + this.pca_version,
        search;

    url += '&Key=' + encodeURIComponent(this.pcaKey);
    url += "&LastId=" + encodeURIComponent('');
    url += "&SearchFor=" + encodeURIComponent('Everything');
    url += "&Country=" + encodeURIComponent(this.country);
    url += "&LanguagePreference=" + encodeURIComponent('en');

    findAddressBtn.addEventListener('click', function (e) {

        e.preventDefault();
        this.lockFindBtn();
        search = "&SearchTerm=" + encodeURIComponent(this.elements.pcaLongAddress.value);
        this.fetchData(url + search, this.createAddressOptions.bind(this));

    }.bind(this));
};

csPcaAddress.unlockFindBtn = function () {
    this.elements.findAddressBtn.removeAttribute('disabled');
    document.querySelector('.button_spinner').remove();
};

csPcaAddress.lockFindBtn = function () {

    var preloader = this.createNode('span', 'button_spinner', null),
        el = this.elements.findAddressBtn,
        is_pcaAddress = document.querySelector('.js-cs-pcaAddress');

    el.setAttribute('disabled', 'true');
    el.appendChild(preloader);

    if (is_pcaAddress) {
        is_pcaAddress.remove();
    }
};

csPcaAddress.fetchData = function (url, callback) {

    return fetch(
        url
    )
        .then(this.checkStatus)
        .then(this.parseJSON)
        .then(function (data) {

            if (data.Items.length) {
                callback(data.Items);
            }

            if (!data.Items.length) {
                this.unlockFindBtn();
            }
        }.bind(this))
        .catch(function () {

        }.bind(this));
};

csPcaAddress.checkStatus = function (response) {

    if (response.status >= 200 && response.status < 300) {
        return response;
    } else {
        var error = new Error(response.statusText);
        error.response = response;
        throw error;
    }
};

csPcaAddress.parseJSON = function (response) {
    return response.json();
};

csPcaAddress.createAddressOptions = function (Items) {

    var createSelectAddress = document.createElement('select'),
        addressOptions = '',
        count = 1;

    this.unlockFindBtn();

    createSelectAddress.className = 'js-cs-pcaAddressSelect form-control';

    Items.forEach(function (val) {

        if (count === 1) {
            addressOptions += '<option value="">Please select the address</option>';
        }

        addressOptions += '<option value="' + val.Id + '">' + val.Text + '</option>';

        count++;

    });

    createSelectAddress.innerHTML = addressOptions;
    document.querySelector('.js-cs-pca-manual').parentNode.appendChild(createSelectAddress);
    this.selectAddress();
};

csPcaAddress.selectAddress = function () {

    var selectAddress = document.querySelector('.js-cs-pcaAddressSelect'),
        url = this.pca_url + 'RetrieveFormatted/' + this.pca_version;

    url += '&Key=' + encodeURIComponent(this.pcaKey);
    url += "&Source=" + encodeURIComponent('');
    url += "&$cache=" + encodeURIComponent(true);

    selectAddress.addEventListener('change', function () {
        url += "&Id=" + encodeURIComponent(selectAddress.value);
        this.fetchData(url, this.getAddress.bind(this));
    }.bind(this));
};

csPcaAddress.getAddress = function (Item) {

    var item = Item[0],
        el, prop;

    this.removeElement('.js-cs-pcaAddressSelect');

    for (prop in item) {

        el = document.querySelector('.js-cs-pca-' + prop);
        console.log('prop', prop);

        if (el) {
            el.value = item[prop];
        }
    }

    console.log('item', item);
};

csPcaAddress.createNode = function () {

    var create = document.createElement(arguments[0]);

    if (arguments[1]) {
        create.className = arguments[1];
    }

    if (arguments[2]) {
        create.innerHTML = arguments[2];
    }

    return create;
};

csPcaAddress.removeElement = function (eleName) {
    document.querySelector(eleName).remove();
};

document.registerElement('cs-pcaaddress', {
    prototype: csPcaAddress
});