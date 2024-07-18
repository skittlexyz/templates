package main

import (
	"bufio"
	"fmt"
	"os"
	"os/exec"
	"path/filepath"
	"strings"

	"github.com/eiannone/keyboard"
	"github.com/fatih/color"
)

type Template struct {
	Name        string
	Path        string
	Description string
	Author      string
}

func main() {
	reader := bufio.NewReader(os.Stdin)

	repoURL := "https://github.com/skittlexyz/templates"
	destDir := ""
	templatePath := ""

	templates := [...]Template{
		{
			Name:        "QuickSvelte",
			Path:        "templates/quick-svelte",
			Description: "Svelte, TypeScript, shadcn/ui, Lucide.",
			Author:      "skittlexyz",
		},
	}

	selectedTemplate := 0

	err := keyboard.Open()
	if err != nil {
		fmt.Println("An error has ocurred: ", err)
		return
	}
	defer keyboard.Close()

	for {
		fmt.Print("\033[H\033[2J")

		printBanner()

		fmt.Println(color.WhiteString("   Choose your template!") + color.CyanString(" ──╮"))
		fmt.Println(color.CyanString(" ╭─────────────────────────╯"))
		for i, item := range templates {
			if i == selectedTemplate {
				fmt.Printf(color.CyanString(" │ ->")+color.CyanString(" %s - %s\n"), item.Name, item.Description)
			} else {
				fmt.Printf(color.CyanString(" │")+color.WhiteString(" %s\n"), item.Name)
			}
		}
		fmt.Println(color.CyanString(" ╰── ") + color.WhiteString("\x1b]8;;https://github.com/skittlexyz/templates\x1b\\skittlexyz/templates\x1b]8;;\x1b\\"))

		_, key, err := keyboard.GetKey()
		if err != nil {
			fmt.Println("Error reading key:", err)
			return
		}

		switch key {
		case keyboard.KeyArrowUp:
			if selectedTemplate > 0 {
				selectedTemplate--
			}
		case keyboard.KeyArrowDown:
			if selectedTemplate < len(templates)-1 {
				selectedTemplate++
			}
		case keyboard.KeyEnter:
			fmt.Print("\033[H\033[2J")

			printBanner()

			fmt.Println(color.WhiteString("   Type the install path!") + color.CyanString(" ─╮"))
			fmt.Println(color.CyanString(" ╭─────────────────────────╯"))
			fmt.Print(color.CyanString(" ╰── -> "))

			tempDestDir, err := reader.ReadString('\n')
			if err != nil {
				fmt.Printf("Error reading user input: %v\n", err)
				return
			}

			destDir = strings.TrimSpace(tempDestDir)
			templatePath = templates[0].Path

			fmt.Print("\033[H\033[2J")
			downloadTemplate(repoURL, destDir, templatePath)

			//fmt.Print("\033[H\033[2J")

			printBanner()

			fmt.Println(color.WhiteString("   Template downloaded!") + color.CyanString(" ───╮"))
			fmt.Println(color.CyanString(" ╭─────────────────────────╯"))
			fmt.Println(color.CyanString(" ╰── ") + color.WhiteString("\x1b]8;;https://github.com/skittlexyz/templates\x1b\\skittlexyz/templates\x1b]8;;\x1b\\\n"))

			os.Exit(0)
		}
	}

}

func printBanner() {
	fmt.Println(color.CyanString("   ______               __     __"))
	fmt.Println(color.CyanString("  /_  __/__ __ _  ___  / /__ _/ /____ ___"))
	fmt.Println(color.CyanString("   / / / -_)  ' \\/ _ \\/ / _ `/ __/ -_|_-<"))
	fmt.Println(color.CyanString("  /_/  \\__/_/_/_/ .__/_/\\_,_/\\__/\\__/___/"))
	fmt.Println(color.CyanString("               /_/\n"))
}

func downloadTemplate(repoURL, destDir, templatePath string) {
	if err := cloneRepository(repoURL, destDir); err != nil {
		fmt.Printf("Error cloning repository: %v\n", err)
		return
	}
	if err := moveFolderContents(filepath.Join(destDir, templatePath), destDir); err != nil {
		fmt.Printf("Error moving folder contents: %v\n", err)
		return
	}
	if err := os.RemoveAll(filepath.Join(destDir, templatePath)); err != nil {
		fmt.Printf("Error removing folder '%s': %v\n", templatePath, err)
		return
	}
	if err := removeFile(filepath.Join(destDir, ".gitignore")); err != nil {
		fmt.Printf("Error removing .gitignore file: %v\n", err)
		return
	}
	if err := removeFile(filepath.Join(destDir, "install_wizard.ps1")); err != nil {
		fmt.Printf("Error removing .gitignore file: %v\n", err)
		return
	}
	if err := removeFile(filepath.Join(destDir, "install_wizard.sh")); err != nil {
		fmt.Printf("Error removing .gitignore file: %v\n", err)
		return
	}
	if err := removeFolder(filepath.Join(destDir, "templates")); err != nil {
		fmt.Printf("Error removing templates folder: %v\n", err)
		return
	}
	if err := removeFolder(filepath.Join(destDir, "wizard")); err != nil {
		fmt.Printf("Error removing templates folder: %v\n", err)
		return
	}
}

func cloneRepository(repoURL, destDir string) error {
	cmd := exec.Command("git", "clone", "--depth=1", repoURL, destDir)
	cmd.Stdout = os.Stdout
	cmd.Stderr = os.Stderr
	return cmd.Run()
}

func moveFolderContents(src, dest string) error {
	files, err := os.ReadDir(src)
	if err != nil {
		return err
	}

	for _, file := range files {
		srcPath := filepath.Join(src, file.Name())
		destPath := filepath.Join(dest, file.Name())

		if err := os.Rename(srcPath, destPath); err != nil {
			return err
		}
	}

	return nil
}

func removeFile(filePath string) error {
	return os.Remove(filePath)
}

func removeFolder(folderPath string) error {
	return os.RemoveAll(folderPath)
}
