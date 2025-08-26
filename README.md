# Study Buddy - ADHD Focus Friend

A simple, focused app that provides a virtual "body double" for children with ADHD to help them stay on task during homework and study time.

## 🎯 Core Concept

Study Buddy is a virtual companion that sits with your child while they work, providing gentle encouragement and accountability without the need for constant parent supervision.

## 🏗️ Modular Architecture Features

### ✅ Configuration-Driven Design
- **Single source of truth** - All behavior controlled from one config file
- **No hardcoded values** - Every timing, size, color comes from configuration
- **Easy customization** - Change one value, updates everywhere automatically
- **Age-responsive** - UI automatically scales for different age groups
- **Future-proof** - Add new age groups by adding data, not code

### ✅ Flexible Content System
- **Dynamic message generation** - Content adapts to age and personality
- **Modular subjects** - Easy to add new subjects without code changes
- **Personality-driven** - Buddy behavior determined by personality templates
- **Responsive UI** - Automatically adapts to different screen sizes

### ✅ Maintainable Codebase
- **Centralized timing** - All delays and durations in one place
- **Computed configurations** - Complex logic generated from simple data
- **Scalable design** - Components adapt automatically to configuration changes
- **Clean separation** - Data, logic, and presentation clearly separated

## 🚀 Quick Start

### Prerequisites

- Node.js 16+ 
- Expo CLI (`npm install -g expo-cli`)
- iOS Simulator (Mac) or Android Studio (Windows/Mac/Linux)
- Expo Go app on your phone for testing

### Installation

1. Clone the repository
