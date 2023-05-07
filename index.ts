enum StatusMusic {
    stPlay  = "stPlay",
    stPause = "stPause",
}

enum BtnType {
    btnRain = "btnRain",
    btnSun  = "btnSun",
    btnSnow = "btnSnow",
}

interface SchemaMedia {
    image:  string;
    icon:   string;
    music:  string;
}

type SchemaMap = {
    [id in BtnType]: SchemaMedia;
}

const SCHEMA_MEDIA: SchemaMap = {
    [BtnType.btnRain]: {    image: "url(./files/assets/rainy-bg.jpg)",
                            icon:  "./files/assets/icons/cloud-rain.svg",
                            music: "./files/assets/sounds/rain.mp3",
                        },
    [BtnType.btnSun]: {     image: "url(./files/assets/summer-bg.jpg)",
                            icon:  "./files/assets/icons/sun.svg",
                            music: "./files/assets/sounds/summer.mp3",
                        },
    [BtnType.btnSnow]: {    image: "url(./files/assets/winter-bg.jpg)",
                            icon:  "./files/assets/icons/cloud-snow.svg",
                            music: "./files/assets/sounds/winter.mp3",
                        },
}

const DEFAULT_BTN_ID:   BtnType = BtnType.btnRain;
const DEFAULT_BTN:      SchemaMedia = SCHEMA_MEDIA[DEFAULT_BTN_ID];

const ICON_PAUSE=       "./files/assets/icons/pause.svg";

class BtnMusic {
    #element:   HTMLImageElement;
    #icon:      string;
    #_image:    string;
    #_music:    string;
    constructor(public id: BtnType, private currentMusicPlayer: MusicPlayer){
        this.#element = document.getElementById(id) as HTMLImageElement;
        this.#_image = SCHEMA_MEDIA[id]?.image || DEFAULT_BTN?.image;
        this.#icon = SCHEMA_MEDIA[id]?.icon || DEFAULT_BTN?.icon;
        this.#_music = SCHEMA_MEDIA[id]?.music || DEFAULT_BTN?.music;
        const parentDivElement: HTMLDivElement = this.#element.parentNode! as HTMLDivElement;
        parentDivElement.style.backgroundImage = this.#_image;
        parentDivElement.addEventListener('click', () => {
            currentMusicPlayer.CurrentBtn = this as unknown as BtnMusic;
        }
        )
    }

    public setStatusMusic(newStatusMusic: StatusMusic){
        switch(newStatusMusic){
            case StatusMusic.stPause: 
                this.#element!.src = ICON_PAUSE;
                break;
            case StatusMusic.stPlay: 
                this.#element!.src = this.#icon;
                break;
        }
    }

    public get music(): string{
        return this.#_music;
    } 
    public get image(): string{
        return this.#_image;
    } 
}

class MusicPlayer {
    #_currentBtn: BtnMusic | null = null;
    #audioPlayer: HTMLMediaElement;
    #container: HTMLDivElement;
    constructor(){
        this.#audioPlayer = document.getElementById("audioPlayer") as HTMLMediaElement;
        this.#container = document.getElementById("container") as HTMLDivElement;
        const volume: HTMLInputElement = document.getElementById("volume-input") as HTMLInputElement;
        volume.addEventListener('input', (event: Event) => {
            this.#audioPlayer.volume = Number((event.target as HTMLInputElement).value) / 100;
        })
    }

    public set CurrentBtn(newBtn: BtnMusic){
        if(newBtn !== this.#_currentBtn){
            if(this.#_currentBtn){
                this.#_currentBtn.setStatusMusic(StatusMusic.stPlay);
            }
            this.#_currentBtn = newBtn;
            this.#container.style.backgroundImage = this.#_currentBtn.image;
            this.#_currentBtn.setStatusMusic(StatusMusic.stPlay);
            this.#audioPlayer!.src =this.#_currentBtn.music;
            if(this.#audioPlayer?.paused){
                this.#audioPlayer.play();
            }
        }else{
            this.#_currentBtn.setStatusMusic(StatusMusic.stPause);
            if(!this.#audioPlayer!.paused){
                this.#audioPlayer!.pause();
            }else{
                this.#_currentBtn.setStatusMusic(StatusMusic.stPlay);
                this.#audioPlayer!.play();
            }
        }

    }

}

const musicPlayer: MusicPlayer = new MusicPlayer();
const  btnsMusic: HTMLCollectionOf<HTMLImageElement> | null = document.getElementsByClassName("btnMusic") as HTMLCollectionOf<HTMLImageElement> | null;
const arrayBtnsMusic: BtnMusic[] | null = [].slice.call(btnsMusic).map((item: HTMLImageElement) => new BtnMusic(item!.id as BtnType, musicPlayer))


