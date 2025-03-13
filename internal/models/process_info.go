package models

import (
	"fmt"
	"github.com/shirou/gopsutil/v3/mem"
	"github.com/shirou/gopsutil/v3/process"
	_ "github.com/wailsapp/wails/v2/pkg/runtime"
	"sort"
)

type ProcessInfoInterface interface {
	GetTopProcesses(limit int) ([]ProcessInfo, error)
}

// ProcessInfo representa la información de un proceso
type ProcessInfo struct {
	PID         int32   `json:"pid"`
	Name        string  `json:"name"`
	CPUUsage    float64 `json:"cpuUsage"`
	MemoryMB    float64 `json:"memoryMB"`
	MemoryUsage float64 `json:"memoryUsage"`
	Status      string  `json:"status"`
	CreatedAt   int64   `json:"createdAt"`
}

type ProcessInfoModel struct {
	ProcessInfos []ProcessInfo
}

// GetTopProcesses obtiene los procesos que más recursos consumen
func (d *ProcessInfoModel) GetTopProcesses(limit int, orderField string, order string) ([]ProcessInfo, error) {
	processes, err := process.Processes()
	if err != nil {
		return nil, fmt.Errorf("error obteniendo procesos: %w", err)
	}

	processInfos := make([]ProcessInfo, 0, len(processes))

	for _, p := range processes {
		name, err := p.Name()
		if err != nil {
			continue
		}

		cpuPercent, err := p.CPUPercent()
		if err != nil {
			cpuPercent = 0
		}

		// Información de memoria
		fullMemInfo, err := mem.VirtualMemory()
		if err != nil {
			return nil, fmt.Errorf("error obteniendo información de memoria: %w", err)
		}

		memInfo, err := p.MemoryInfo()
		var memoryMB float64
		if err == nil && memInfo != nil {
			memoryMB = float64(memInfo.RSS) / 1024 / 1024
		}
		if err != nil || memInfo == nil {
			return nil, fmt.Errorf("error obteniendo información de memoria: %w", err)
		}

		statusArray, err := p.Status()
		status := "unknown"
		if err == nil && len(statusArray) > 0 {
			status = statusArray[0]
		}

		createTime, err := p.CreateTime()
		if err != nil {
			createTime = 0
		}

		processInfos = append(processInfos, ProcessInfo{
			PID:         p.Pid,
			Name:        name,
			CPUUsage:    cpuPercent,
			MemoryMB:    memoryMB,
			MemoryUsage: float64(memInfo.RSS) * 100 / float64(fullMemInfo.Total),
			Status:      status,
			CreatedAt:   createTime,
		})
	}

	// ordenar por uso de CPU
	if order == "desc" {
		if orderField == "cpu" {
			sort.Slice(processInfos, func(i, j int) bool {
				return processInfos[i].CPUUsage > processInfos[j].CPUUsage
			})
		} else if orderField == "ram" {
			sort.Slice(processInfos, func(i, j int) bool {
				return processInfos[i].MemoryMB > processInfos[j].MemoryMB
			})
		}

	} else {
		if orderField == "cpu" {
			sort.Slice(processInfos, func(i, j int) bool {
				return processInfos[i].CPUUsage < processInfos[j].CPUUsage
			})
		} else if orderField == "ram" {
			sort.Slice(processInfos, func(i, j int) bool {
				return processInfos[i].MemoryMB < processInfos[j].MemoryMB
			})
		}
	}

	// Limitar a los primeros 'limit' procesos (podría implementar un ordenamiento aquí)
	if len(processInfos) > limit && limit > 0 {
		processInfos = processInfos[:limit]
	}

	return processInfos, nil
}
