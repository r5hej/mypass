const copyTarget = document.createElement("textarea");
copyTarget.style.opacity = '0';

export default {
    _target: copyTarget,
    copy: function(text) {
        event.stopPropagation();
        copyTarget.textContent = text;
        document.body.appendChild(copyTarget);
        copyTarget.select();
        document.execCommand("copy");
        copyTarget.textContent = "";
        document.body.removeChild(copyTarget);
    }
}