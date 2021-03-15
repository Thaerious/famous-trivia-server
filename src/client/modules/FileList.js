
class FileList extends HTMLElement{

    constructor(props) {
        super(props);
        window.addEventListener("load", (event)=>this.load());
    }

    load(){
        this.querySelector(".close").addEventListener("click", ()=>{
            this.hide();
        });
    }

    clear(){
        for (let ele of this.querySelectorAll(".file-item")){
            this.querySelector("#inner-list").removeChild(ele);
        }
    }

    addItem(filename, id){
        let meta = document.createElement("div");
        meta.classList.add("file-item");
        meta.setAttribute("data-id", id);
        this.querySelector("#inner-list").appendChild(meta);

        let ele = document.createElement("span");
        ele.classList.add("file-name");
        ele.innerText = filename;
        meta.appendChild(ele);

        ele.addEventListener("click", ()=>this.cb(id));

        ele = document.createElement("span");
        ele.classList.add("delete");
        ele.innerText = "Delete";
        meta.appendChild(ele);

        ele.addEventListener("click", ()=>this.del(id));
    }

    show(){
        this.classList.remove("hidden");
    }

    hide(){
        this.classList.add("hidden");
    }

    set busy(value){
        if (value) this.querySelector("#file-list-busy").classList.remove("hidden");
        else this.querySelector("#file-list-busy").classList.add("hidden");
    }
}

window.customElements.define('file-list', FileList);
module.exports = FileList;