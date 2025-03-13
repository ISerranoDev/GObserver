package app

import "gobserver.iserranodev.net/internal/models"

// GetSystemInfo obtiene la información del sistema
func (a *App) GetSystemInfo() (*models.SystemInfo, error) {
	return a.systemInfo.GetSystemInfo()
}

// GetTopProcesses obtiene los procesos principales
func (a *App) GetTopProcesses(limit int, orderField string, order string) ([]models.ProcessInfo, error) {
	return a.processInfo.GetTopProcesses(limit, orderField, order)
}

// GetDisksInfo obtiene la información de los discos
func (a *App) GetDisksInfo() ([]models.DiskInfo, error) {
	return a.diskInfo.GetDisksInfo()
}
