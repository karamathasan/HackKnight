// Opens the offscreen camera document while the popup's Enable toggle is on.
let queue = Promise.resolve()

function syncCamera(enabled){
    queue = queue.then(() => applyCamera(enabled)).catch(console.error)
}

async function applyCamera(enabled){
    const contexts = await chrome.runtime.getContexts({ contextTypes: ['OFFSCREEN_DOCUMENT'] })
    const open = contexts.length > 0
    if (enabled && !open) {
        await chrome.offscreen.createDocument({
            url: 'offscreen.html',
            reasons: ['USER_MEDIA'],
            justification: 'Capture webcam frames for gesture detection'
        })
    } else if (!enabled && open) {
        await chrome.offscreen.closeDocument()
    }
}

async function restoreCamera(){
    const { enabled } = await chrome.storage.local.get('enabled')
    syncCamera(!!enabled)
}

chrome.storage.onChanged.addListener((changes, area) => {
    if (area === 'local' && changes.enabled) {
        syncCamera(!!changes.enabled.newValue)
    }
})

chrome.runtime.onStartup.addListener(restoreCamera)
chrome.runtime.onInstalled.addListener(restoreCamera)
