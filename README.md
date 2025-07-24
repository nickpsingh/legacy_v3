# Legacy V2 - Enhanced Estate Planning Platform

An enhanced and improved version of the estate planning platform built with React, TypeScript, and Tailwind CSS. This version includes significant improvements to user experience, asset management, and document creation workflows.

## ✨ New Features & Enhancements

### 🔧 **Enhanced Asset Integration**
- **Seamless Asset Management**: Assets from your Assets page now automatically populate in the Will Creator
- **Visual Asset Selection**: Click to select/deselect assets with clear visual feedback (blue borders and checkmarks)
- **In-Line Asset Creation**: Add new assets directly from the Will Creator without leaving the workflow
- **Asset Summary Display**: See selected assets count and total value at a glance
- **Persistent Asset Selection**: Your asset choices are saved and restored when editing drafts

### 📄 **Improved Document Management** 
- **Document Type Descriptions**: Clear one-line descriptions for each document type in the "Create New Document" dropdown:
  - **Last Will & Testament**: Distribute your assets and name guardians for minor children
  - **Living Trust**: Avoid probate and manage assets during your lifetime and after death
  - **Power of Attorney**: Authorize someone to make financial and legal decisions on your behalf
  - **Living Will**: Document your medical treatment preferences if you cannot communicate

### 🎨 **Enhanced User Experience**
- **Improved Modal Design**: Better-styled Add Asset modal with comprehensive form fields
- **Visual Feedback**: Enhanced selection states and hover effects throughout the application
- **Progress Persistence**: All form progress including asset selections are automatically saved
- **Error Handling**: Better validation and user feedback for form submissions

## Features

- 📄 **Document Creation** (Enhanced)
  - Will Creator with integrated asset management
  - Trust Creator 
  - Power of Attorney
  - Living Will
- 💰 **Asset Management** (Enhanced)
  - Comprehensive asset tracking
  - Seamless integration with document creation
  - In-line asset creation capabilities
- 👥 **Beneficiary Management**
- 🔒 **Secure Document Storage**
- 🤖 **AI-Assisted Form Filling**
- ⚖️ **Legal Review Integration**

## Tech Stack

- React 18
- TypeScript
- Redux Toolkit
- Tailwind CSS
- React Router v6
- Material-UI Components
- Auth0 Authentication

## Getting Started

### Prerequisites

- Node.js 16+ and npm

### Installation

1. Clone the repository:
```bash
git clone https://github.com/nickpsingh/legacy_v2.git
cd legacy_v2
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory and add necessary environment variables:
```bash
cp .env.example .env
```

4. Start the development server:
```bash
npm start
```

The application will be available at `http://localhost:3000`

### Building for Production

```bash
npm run build
```

## What's New in V2

### Asset Integration Improvements
- **Connected Workflow**: Assets created in the Assets page are now available in the Will Creator
- **Visual Selection Interface**: Easy-to-use checkboxes with visual feedback for selecting assets
- **Modal Asset Creation**: Create new assets without leaving the will creation process
- **Automatic Sync**: New assets are automatically added to your asset list and selected for the will

### Document Creation Enhancements  
- **Guided Experience**: Clear descriptions help users understand what each document type does
- **Better Navigation**: Improved dropdown with descriptions reduces confusion
- **Enhanced Tooltips**: Helpful information throughout the document creation process

### Technical Improvements
- **TypeScript Fixes**: Resolved React Icons compilation issues for better development experience
- **Enhanced State Management**: Better Redux integration for asset management
- **Improved Save Logic**: More robust saving and loading of document drafts

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.

## Deployment

The application can be deployed on Vercel, Netlify, or any static hosting service.

## Contact

Nick Singh - [@nickpsingh](https://twitter.com/nickpsingh)

Project Link: [https://github.com/nickpsingh/legacy_v2](https://github.com/nickpsingh/legacy_v2)

---

## Version History

- **V2.0**: Enhanced asset integration, improved document descriptions, better user experience
- **V1.0**: Initial estate planning platform with basic document creation capabilities
