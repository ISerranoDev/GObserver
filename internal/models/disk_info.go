package models

import (
	"fmt"
	"github.com/shirou/gopsutil/v3/disk"
	_ "github.com/wailsapp/wails/v2/pkg/runtime"
)

type DiskInfoInterface interface {
	GetDisksInfo(limit int) ([]DiskInfo, error)
}

// DiskInfo representa la información de una partición de disco
type DiskInfo struct {
	Path        string  `json:"path"`
	Total       uint64  `json:"total"`
	Used        uint64  `json:"used"`
	Free        uint64  `json:"free"`
	UsedPercent float64 `json:"usedPercent"`
	Filesystem  string  `json:"filesystem"`
}

type DiskInfoModel struct {
	DiskInfos []DiskInfo
}

// GetDisksInfo obtiene la información de todas las particiones de disco
func (d *DiskInfoModel) GetDisksInfo() ([]DiskInfo, error) {
	partitions, err := disk.Partitions(true)
	if err != nil {
		return nil, fmt.Errorf("error obteniendo particiones: %w", err)
	}

	disksInfo := make([]DiskInfo, 0, len(partitions))

	for _, partition := range partitions {
		usage, err := disk.Usage(partition.Mountpoint)
		if err != nil {
			continue
		}

		disksInfo = append(disksInfo, DiskInfo{
			Path:        partition.Mountpoint,
			Total:       usage.Total,
			Used:        usage.Used,
			Free:        usage.Free,
			UsedPercent: usage.UsedPercent,
			Filesystem:  partition.Fstype,
		})
	}

	return disksInfo, nil
}
