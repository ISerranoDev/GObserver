package app

import (
	"context"
	"gobserver.iserranodev.net/internal/models"
)

// App struct
type App struct {
	ctx         context.Context
	systemInfo  *models.SystemInfoModel
	processInfo *models.ProcessInfoModel
	diskInfo    *models.DiskInfoModel
}

// NewApp creates a new App application struct
func NewApp() *App {
	return &App{}
}

// Startup startup is called when the app starts. The context is saved so we can call the runtime methods
func (a *App) Startup(ctx context.Context) {
	a.ctx = ctx
}
