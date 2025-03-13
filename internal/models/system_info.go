package models

import (
	"fmt"
	"github.com/shirou/gopsutil/v3/cpu"
	"github.com/shirou/gopsutil/v3/disk"
	"github.com/shirou/gopsutil/v3/host"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/process"
	_ "github.com/wailsapp/wails/v2/pkg/runtime"
	"runtime"
	"time"
)

type SystemInfoInterface interface {
	GetSystemInfo() (*SystemInfo, error)
}

// SystemInfo representa la información del sistema
type SystemInfo struct {
	Hostname      string  `json:"hostname"`
	Platform      string  `json:"platform"`
	CPUUsage      float64 `json:"cpuUsage"`
	MemoryUsage   float64 `json:"memoryUsage"`
	MemoryTotal   uint64  `json:"memoryTotal"`
	DiskUsage     float64 `json:"diskUsage"`
	DiskTotal     uint64  `json:"diskTotal"`
	Uptime        uint64  `json:"uptime"`
	ProcessCount  int     `json:"processCount"`
	GoVersion     string  `json:"goVersion"`
	CPUModel      string  `json:"cpuModel"`
	CoreCount     int     `json:"coreCount"`
	ThreadCount   int     `json:"threadCount"`
	OSVersion     string  `json:"osVersion"`
	KernelVersion string  `json:"kernelVersion"`
}

type SystemInfoModel struct {
	SystemInfos []SystemInfo
}

// GetSystemInfo obtiene la información del sistema
func (d *SystemInfoModel) GetSystemInfo() (*SystemInfo, error) {
	// Información del host
	hostInfo, err := host.Info()
	if err != nil {
		return nil, fmt.Errorf("error obteniendo información del host: %w", err)
	}

	// Uso de CPU
	cpuPercent, err := cpu.Percent(time.Second, false)
	if err != nil {
		return nil, fmt.Errorf("error obteniendo uso de CPU: %w", err)
	}

	// Información de memoria
	memInfo, err := mem.VirtualMemory()
	if err != nil {
		return nil, fmt.Errorf("error obteniendo información de memoria: %w", err)
	}

	// Información de disco
	diskInfo, err := disk.Usage("/")
	if err != nil {
		// Intenta con C: en Windows
		if runtime.GOOS == "windows" {
			diskInfo, err = disk.Usage("C:")
			if err != nil {
				return nil, fmt.Errorf("error obteniendo información de disco: %w", err)
			}
		} else {
			return nil, fmt.Errorf("error obteniendo información de disco: %w", err)
		}
	}
	// Contar procesos
	processes, err := process.Processes()
	if err != nil {
		return nil, fmt.Errorf("error obteniendo lista de procesos: %w", err)
	}

	// Obtener el modelo del procesador
	info, err := cpu.Info()
	if err != nil {
		return nil, fmt.Errorf("error al obtener información del procesador: %w", err)
	}

	// Mostrar el modelo del procesador
	cpuModel := "Sin información"
	if len(info) > 0 {
		cpuModel = info[0].ModelName
	}

	// Número de núcleos
	numCores, err := cpu.Counts(false)
	if err != nil {
		return nil, fmt.Errorf("error obteniendo lista de núcleos: %w", err)
	}

	numThreads, err := cpu.Counts(true)
	if err != nil {
		return nil, fmt.Errorf("error obteniendo lista de hilos: %w", err)
	}

	return &SystemInfo{
		Hostname:      hostInfo.Hostname,
		Platform:      hostInfo.Platform,
		CPUUsage:      cpuPercent[0],
		MemoryUsage:   memInfo.UsedPercent,
		MemoryTotal:   memInfo.Total,
		DiskUsage:     diskInfo.UsedPercent,
		DiskTotal:     diskInfo.Total,
		Uptime:        hostInfo.Uptime,
		ProcessCount:  len(processes),
		GoVersion:     runtime.Version(),
		CPUModel:      cpuModel,
		CoreCount:     numCores,
		ThreadCount:   numThreads,
		OSVersion:     hostInfo.PlatformVersion,
		KernelVersion: hostInfo.KernelVersion,
	}, nil
}
