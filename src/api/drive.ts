// Stub for Google Drive API

export async function initGoogleDrive(): Promise<void> {
    console.log('Stub: initGoogleDrive');
    return Promise.resolve();
}

export async function signInToGoogle(): Promise<void> {
    console.log('Stub: signInToGoogle');
    return Promise.resolve();
}

export async function signOutFromGoogle(): Promise<void> {
    console.log('Stub: signOutFromGoogle');
    return Promise.resolve();
}

export async function saveFileToDrive(fileName: string, content: string): Promise<void> {
    console.log(`Stub: saveFileToDrive ${fileName}`, content);
    return Promise.resolve();
}

export async function loadFileFromDrive(fileName: string): Promise<string | null> {
    console.log(`Stub: loadFileFromDrive ${fileName}`);
    return Promise.resolve(null);
}
