function inicializarMapa() {
    var map = L.map('map').setView([0, 0], 2);
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png').addTo(map);

    map.on('dblclick', function(e) {
        var lat = e.latlng.lat;
        var lng = e.latlng.lng;
        addMarker([lat, lng]);
    });

    // Icono predeterminado para marcadores
    const defaultIcon = L.icon({
        iconUrl: 'https://cdn-icons-png.flaticon.com/512/684/684908.png', // Icono de corazón
        iconSize: [32, 32],
        iconAnchor: [16, 32]
    });

}