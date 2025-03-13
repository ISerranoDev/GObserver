import Chart from 'chart.js/auto';

window.addDataToChart = function (chart, label, newData) {
    chart.data.labels.push(label);
    chart.data.datasets.forEach((dataset) => {
        dataset.data.push(newData);
    });
    chart.update();
}

window.processorChart = new Chart(
    document.getElementById('cpu-chart'),
    {
        type: 'line',
        data: {
            labels: [], // No hay etiquetas al inicio
            datasets: [{
                label: 'Uso de CPU',
                data: [], // No hay datos al inicio
                fill: false, // No rellenar el área bajo la línea
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: 'rgb(194, 199, 208)',
                    }
                },
                title: {
                    display: true,
                    text: 'Uso de Procesador',
                    color: 'rgb(194, 199, 208)',
                    font: {
                        size: 18, // Tamaño del texto del título
                        family: 'Chakra Petch', // Fuente del título
                    }
                },

            },
            scales: {
                x: {
                    ticks: {
                        color: 'rgb(63,163,163)', // Color de los ticks en el eje X
                    }
                },
                y: {
                    min: 0,
                    ticks: {
                        color: 'rgb(63,163,163)', // Color de los ticks en el eje Y
                    }
                }
            }
        },
    }
);

window.memoryChart = new Chart(
    document.getElementById('memory-chart'),
    {
        type: 'line',
        data: {
            labels: [], // No hay etiquetas al inicio
            datasets: [{
                label: 'Uso de Memoria RAM',
                data: [], // No hay datos al inicio
                fill: false, // No rellenar el área bajo la línea
            }]
        },
        options: {
            responsive: true,
            plugins: {
                legend: {
                    position: 'top',
                    labels: {
                        color: 'rgb(194, 199, 208)',
                    }
                },
                title: {
                    display: true,
                    text: 'Uso de memoria RAM',
                    color: 'rgb(194, 199, 208)',
                    font: {
                        size: 18, // Tamaño del texto del título
                        family: 'Chakra Petch', // Fuente del título
                    }
                },

            },
            scales: {
                x: {
                    ticks: {
                        color: 'rgb(63,163,163)', // Color de los ticks en el eje X
                    }
                },
                y: {
                    min: 0,

                    ticks: {
                        color: 'rgb(63,163,163)', // Color de los ticks en el eje Y
                    }
                }
            }
        },
    }
);