const {
    contextBridge,
    ipcRenderer
} = require('electron');

// set local storage
localStorage.setItem('autoScroll', 'true');
alert = () => {};

// clear ajaxHelper
const clearAjaxHelper = () => {
    AjaxHelper.setLoadWaiting = () => {};
    AjaxHelper.processAjaxError = (e) => {
        setTimeout((function() {
            location.reload()
        }), 100)
    }
}

clearAjaxHelper();

document.addEventListener('DOMContentLoaded', () => {
    try {
        const images = document.querySelectorAll('img');
        // delete all images
        images.forEach((image) => image.remove());

        alert = () => {}

        let autoScroll = true;

        const initComponent = () => {
            const myComponent = document.createElement('div');
            myComponent.id = 'my-component';
            document.body.appendChild(myComponent);

            return myComponent;
        }

        const initButton = (myComponent) => {
            // add auto scroll button
            const autoScrollButton = document.createElement('button');
            autoScrollButton.id = 'auto-scroll-button';
            autoScrollButton.innerText = 'Auto scroll';

            // button always sticks to the bottom right corner
            autoScrollButton.style.position = 'fixed';
            autoScrollButton.style.bottom = '0';
            autoScrollButton.style.right = '100px';
            // add style
            autoScrollButton.style.backgroundColor = localStorage.getItem('autoScroll') === 'true' ? 'green' : 'red';
            autoScrollButton.style.color = 'white';
            autoScrollButton.style.border = 'none';
            autoScrollButton.style.padding = '2px';
            autoScrollButton.style.borderRadius = '5px';
            autoScrollButton.style.cursor = 'pointer';
            // z-index
            autoScrollButton.style.zIndex = '9999';

            // width and height scale with window size
            autoScrollButton.style.width = window.innerWidth * 0.3 + 'px';
            autoScrollButton.style.height = window.innerHeight * 0.05 + 'px';

            myComponent.appendChild(autoScrollButton);

            return autoScrollButton;
        }

        const initButtonEvent = (autoScrollButton) => {
            // add event listener
            autoScrollButton.addEventListener('click', async () => {
                autoScroll = !autoScroll;
                if (autoScroll) {
                    autoScrollButton.style.backgroundColor = 'green';
                    // add local storage
                    localStorage.setItem('autoScroll', 'true');

                    await clickNextButton(false);
                } else {
                    autoScrollButton.style.backgroundColor = 'red';
                    localStorage.setItem('autoScroll', 'false');
                }
            });
        }

        const clickNextButton = async (wait = true) => {
            const nextButton = document.querySelector('.next');

            if (nextButton.classList.contains('disabled')) {
                ipcRenderer.send('reaad-done', 'read done');
            }

            if (nextButton) {
                setTimeout(() => {
                    ipcRenderer.send('next', location.href);
                    nextButton.click();
                }, 7.1 * 1000)
            } else {
                console.log('next button not found');
                location.reload();
            }
        }

        const component = initComponent();
        const button = initButton(component);
        initButtonEvent(button);

        if (localStorage.getItem('autoScroll') === 'true') {
            clickNextButton().then();
        }
    } catch (e) {
        location.reload();
    }
});
