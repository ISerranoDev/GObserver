// Import the CSS
import './assets/css/pico.purple.min.css';
import './assets/css/siimple-icons.css';
import './assets/css/main.css';
import 'izitoast/dist/css/iziToast.min.css';

import logo from './assets/images/logo-universal.png';
// Importación correcta desde wailsjs/go/main/App
import { GetSystemInfo, GetTopProcesses, GetDisksInfo } from '../wailsjs/go/app/App';
import iziToast from "izitoast";

// Configurar un intervalo para actualizar automáticamente los datos
let loadSystemInfoInterval = null;
let loadProcessesInfoInterval = null;
let loadDisksInfoInterval = null;

window.loadInterval = 1000;

function clearAllIntervals() {
    if(loadSystemInfoInterval) clearInterval(loadSystemInfoInterval);
    if(loadProcessesInfoInterval) clearInterval(loadProcessesInfoInterval);
    if(loadDisksInfoInterval) clearInterval(loadDisksInfoInterval);
}

window.reinstanceIntervals = function () {
    if(loadSystemInfoInterval){
        clearInterval(loadSystemInfoInterval);
        loadSystemInfoInterval = setInterval(loadSystemInfo, loadInterval);
    }
    if(loadProcessesInfoInterval){
        clearInterval(loadProcessesInfoInterval);
        loadProcessesInfoInterval = setInterval(loadProcesses, loadInterval);
    }
    if(loadDisksInfoInterval) {
        clearInterval(loadDisksInfoInterval);
        loadDisksInfoInterval = setInterval(loadDisks, loadInterval);
    }
}

function instanceSystemInfoInterval() {
    clearAllIntervals();
    loadSystemInfoInterval = setInterval(loadSystemInfo, loadInterval);
}

function instanceProcessesInfoInterval() {
    clearAllIntervals();
    loadProcessesInfoInterval = setInterval(loadProcesses, loadInterval);
}

function instanceDisksInfoInterval() {
    clearAllIntervals();
    loadDisksInfoInterval = setInterval(loadDisks, loadInterval);
}

window.SYSTEM_TAB = 'system-overview-section';
window.PROCESSES_TAB = 'processes-overview-section';
window.DISKS_TAB = 'disks-overview-section';

const systemTab = document.getElementById(window.SYSTEM_TAB)
const processesTab = document.getElementById(window.PROCESSES_TAB)
const disksTab = document.getElementById(window.DISKS_TAB)

window.changeTab = function (pill, tab) {

    document.querySelector('.nav-button.active').classList.remove('active');

    pill.classList.add('active');

    systemTab.style.display = 'none';
    processesTab.style.display = 'none';
    disksTab.style.display = 'none';

    if(tab === SYSTEM_TAB) {
        systemTab.style.display = 'block';
        instanceSystemInfoInterval();
    } else if(tab === PROCESSES_TAB) {
        processesTab.style.display = 'block';
        instanceProcessesInfoInterval();
    } else if(tab === DISKS_TAB) {
        disksTab.style.display = 'block';
        instanceDisksInfoInterval();
    }
}

window.onload = function () {
    loadSystemInfo();
    instanceSystemInfoInterval();
};

// Función para formatear bytes a unidades legibles
function formatBytes(bytes, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

// Función para formatear tiempo de actividad
function formatUptime(seconds) {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);

    let result = '';
    if (days > 0) result += `${days}d `;
    if (hours > 0) result += `${hours}h `;
    result += `${minutes}m`;

    return result;
}

// Función para cargar la información del sistema
window.loadSystemInfo = function () {
    try {
        GetSystemInfo()
            .then((result) => {
                // Mostrar la información del sistema en el HTML
                if (document.getElementById('hostname')) {
                    document.getElementById('hostname').textContent = result.hostname;
                }
                if (document.getElementById('platform')) {
                    document.getElementById('platform').textContent = `${result.platform} ${result.osVersion}`;
                }
                if (document.getElementById('kernel')) {
                    document.getElementById('kernel').textContent = result.kernelVersion;
                }
                if (document.getElementById('uptime')) {
                    document.getElementById('uptime').textContent = formatUptime(result.uptime);
                }
                if (document.getElementById('cpu-model')) {
                    document.getElementById('cpu-model').textContent = result.cpuModel;
                }
                if (document.getElementById('core-count')) {
                    document.getElementById('core-count').textContent = result.coreCount;
                }
                if (document.getElementById('thread-count')) {
                    document.getElementById('thread-count').textContent = result.threadCount;
                }
                if (document.getElementById('cpu-usage')) {
                    let cpuUsage = result.cpuUsage.toFixed(1);
                    document.getElementById('cpu-usage').textContent = `${cpuUsage}%`;
                    addDataToChart(
                        processorChart,
                        new Date().toLocaleTimeString(),
                        result.cpuUsage
                    )
                }
                if (document.getElementById('memory-usage')) {

                    document.getElementById('memory-usage').textContent =
                        `${result.memoryUsage.toFixed(1)}% (${formatBytes(result.memoryTotal - (result.memoryTotal * (100 - result.memoryUsage) / 100))} / ${formatBytes(result.memoryTotal)})`;

                    addDataToChart(
                        memoryChart,
                        new Date().toLocaleTimeString(),
                        result.memoryUsage
                    )
                }

                // Mostrar información de disco principal
                if (document.getElementById('disk-usage')) {
                    const diskTotalGB = (result.diskTotal / (1024 * 1024 * 1024)).toFixed(2);
                    const diskUsedGB = (result.diskTotal * (result.diskUsage / 100) / (1024 * 1024 * 1024)).toFixed(2);
                    document.getElementById('disk-usage').textContent =
                        `${result.diskUsage.toFixed(1)}% (${diskUsedGB} GB / ${diskTotalGB} GB)`;

                }

                if (document.getElementById('process-count')) {
                    document.getElementById('process-count').textContent = result.processCount;
                }

                // Actualizar las barras de progreso si existen
                if (document.getElementById('cpu-bar')) {
                    document.getElementById('cpu-bar').value = result.cpuUsage;
                }
                if (document.getElementById('memory-bar')) {
                    document.getElementById('memory-bar').value = result.memoryUsage;
                }
                if (document.getElementById('disk-bar')) {
                    document.getElementById('disk-bar').value = result.diskUsage;
                }

            })
            .catch((err) => {
                console.error("Error al cargar información del sistema:", err);
                iziToast.error({
                    title: 'Error',
                    message: 'No se pudo cargar la información del sistema',
                    position: 'topRight'
                });
            });
    } catch (err) {
        console.error(err);
    }
};

window.processesLimit = 10;
window.processesOrderField = 'cpu';
window.processesOrder = 'desc';

// Función para cargar los procesos
window.loadProcesses = function () {
    try {
        GetTopProcesses(processesLimit, processesOrderField, processesOrder) // Obtener los 10 procesos principales
            .then((result) => {
                let html = "";

                // Ordenar procesos por uso de CPU (de mayor a menor)
                result.sort((a, b) => b.cpuUsage - a.cpuUsage);

                for (let i = 0; i < result.length; i++) {
                    const process = result[i];
                    let cpuClass = 'low-usage';
                    if (process.cpuUsage > 50) {
                        cpuClass = 'high-usage';
                    } else if (process.cpuUsage > 20) {
                        cpuClass = 'medium-usage';
                    }

                    let memoryClass = 'low-usage';
                    if (process.memoryUsage > 50) {
                        memoryClass = 'high-usage';
                    } else if (process.memoryUsage > 20) {
                        memoryClass = 'medium-usage';
                    }

                    html += `
                        <tr data-pid="${process.pid}">
                            <th>#${process.pid}</th>
                            <td>${process.name}</td>
                            <td class="${cpuClass}">${process.cpuUsage.toFixed(1)}%</td>
                            <td class="${memoryClass}">${process.memoryUsage.toFixed(1)}%</td>
                            <td></td>
                            
                        </tr>
                    `;
                }

                if (document.getElementById('process-container')) {
                    document.getElementById('process-container').innerHTML = html;
                }

            })
            .catch((err) => {
                console.error("Error al cargar procesos:", err);
                iziToast.error({
                    title: 'Error',
                    message: 'No se pudo cargar la información de procesos',
                    position: 'topRight'
                });
            });
    } catch (err) {
        console.error(err);
    }
};

// Función para cargar información de discos
window.loadDisks = function () {
    try {
        GetDisksInfo()
            .then((result) => {
                let html = "";

                for (let i = 0; i < result.length; i++) {
                    const disk = result[i];

                    // Calcular valores en GB para mejor visualización
                    const totalGB = (disk.total / (1024 * 1024 * 1024)).toFixed(2);
                    const usedGB = (disk.used / (1024 * 1024 * 1024)).toFixed(2);
                    const freeGB = (disk.free / (1024 * 1024 * 1024)).toFixed(2);

                    let usageClass = 'low-usage';
                    if (disk.usedPercent > 90) {
                        usageClass = 'high-usage';
                    } else if (disk.usedPercent > 70) {
                        usageClass = 'medium-usage';
                    }

                    // Calcular el ratio con protección contra errores
                    let usageRatio = 0;
                    let disparityFactor = 0;

                    if (disk.total > 0 && disk.used > 0) {
                        usageRatio = (disk.used / disk.total * 100);
                        disparityFactor = (disk.total / disk.used);
                    }

                    // Verificar que los valores sean números válidos
                    const usageRatioText = !isNaN(usageRatio) && isFinite(usageRatio) ?
                        `${usageRatio.toFixed(2)}%` : "No disponible";

                    const disparityFactorText = !isNaN(disparityFactor) && isFinite(disparityFactor) ?
                        `${disparityFactor.toFixed(2)}x` : "No disponible";

                    // Crear una representación más detallada del disco
                    html += `
                        <article class="disk-article">
                            <div class="disk-info">
                                <h4>${disk.path}</h4>
                                <p>Sistema de archivos: ${disk.filesystem}</p>
                                <div class="disk-metrics">
                                    <div class="disk-metric">
                                        <span>Total:</span>
                                        <strong>${totalGB} GB</strong>
                                    </div>
                                    <div class="disk-metric">
                                        <span>Usado:</span>
                                        <strong class="${usageClass}">${usedGB} GB</strong>
                                    </div>
                                    <div class="disk-metric">
                                        <span>Libre:</span>
                                        <strong>${freeGB} GB</strong>
                                    </div>
                                </div>
                            </div>
                            <div class="disk-usage">
                                <div class="progress-container">
                                    <progress value="${disk.usedPercent}" max="100"></progress>
                                    <span class="${usageClass}">${disk.usedPercent.toFixed(1)}%</span>
                                </div>
                                <div class="disk-values">
                                    <span>Físicamente usado: ${formatBytes(disk.used)}</span>
                                    <span>Reporte de tamaño total: ${formatBytes(disk.total)}</span>
                                </div>
                                <div class="disk-ratio">
                                    <span>Ratio de uso: ${usageRatioText}</span>
                                    <span>Factor de disparidad: ${disparityFactorText}</span>
                                </div>
                            </div>
                        </article>
                    `;
                }

                if (document.getElementById('disk-container')) {
                    document.getElementById('disk-container').innerHTML = html;
                }

                // Mostrar información de análisis en caso de disparidad
                if (result.length > 0) {
                    const disparityAnalysis = analyzeDisparities(result);
                    if (document.getElementById('disk-analysis')) {
                        document.getElementById('disk-analysis').innerHTML = disparityAnalysis;
                    }
                }
            })
            .catch((err) => {
                console.error("Error al cargar discos:", err);
                iziToast.error({
                    title: 'Error',
                    message: 'No se pudo cargar la información de discos',
                    position: 'topRight'
                });
            });
    } catch (err) {
        console.error(err);
    }
};

// Función para analizar disparidades entre uso total y reportado
function analyzeDisparities(disks) {
    let html = '<h3>Análisis de disparidad de discos</h3>';

    for (const disk of disks) {
        // Evitar división por cero y valores muy pequeños
        if (disk.used <= 0 || disk.total <= 0) {
            html += `<p>No hay suficientes datos para analizar la disparidad del disco ${disk.path}.</p>`;
            continue;
        }

        const ratio = disk.total / disk.used;
        let analysisText = '';

        // Verificar que ratio es un número válido y finito
        if (isNaN(ratio) || !isFinite(ratio)) {
            analysisText = `<p>No se puede calcular la disparidad para el disco ${disk.path} debido a valores inválidos.</p>`;
        } else if (ratio > 10) {
            analysisText = `<p class="high-disparity">Alta disparidad (${ratio.toFixed(2)}x): El disco ${disk.path} muestra una gran diferencia entre espacio total y usado. Esto es común en máquinas virtuales con discos de asignación dinámica.</p>`;
        } else if (ratio > 3) {
            analysisText = `<p class="medium-disparity">Disparidad media (${ratio.toFixed(2)}x): El disco ${disk.path} muestra una diferencia notable entre espacio total y usado.</p>`;
        } else {
            analysisText = `<p class="low-disparity">Disparidad baja (${ratio.toFixed(2)}x): El disco ${disk.path} muestra valores coherentes entre espacio total y usado.</p>`;
        }

        html += analysisText;
    }

    html += `
    <div class="disparity-explanation">
        <h4>¿Por qué hay disparidad?</h4>
        <p>En máquinas virtuales, es común ver grandes diferencias entre el espacio total y el espacio usado debido a:</p>
        <ul>
            <li>Asignación dinámica de disco (thin provisioning)</li>
            <li>Compresión transparente del hipervisor</li>
            <li>Sistemas de archivo virtuales</li>
            <li>Metadatos y overhead del hipervisor</li>
        </ul>
    </div>
    `;

    return html;
}

// Función para refrescar todos los datos
window.refreshData = function() {
    loadSystemInfo();
    iziToast.info({
        title: 'Información',
        message: 'Actualizando datos...',
        position: 'topRight',
        timeout: 2000
    });
};

window.toggleAside = function() {
    if(document.querySelector('aside') && document.querySelector('aside').classList.contains('show')) {
        hideAside();
    } else {
        showAside();
    }
};

// Funciones para mostrar/ocultar el panel lateral
window.showAside = function() {
    if(document.querySelector('aside') && document.querySelector('aside').classList.contains('show')) {
        hideAside();
        setTimeout(function() {
            document.querySelector('aside').classList.add('show');
        }, 200);
    } else if(document.querySelector('aside')) {
        document.querySelector('aside').classList.add('show');
    }
    document.body.style.paddingRight = "340px";
};

window.hideAside = function() {
    if(document.querySelector('aside')) {
        document.querySelector('aside').classList.remove('show');
    }
    document.body.style.paddingRight = "30px";
};
