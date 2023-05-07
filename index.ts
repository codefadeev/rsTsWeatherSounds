const ICON_PAUSE =      "./files/assets/icons/pause.svg";

//статус для отображения иконок (родная иконка или иконка паузы)
enum StatusMusic {
    stPlay  = "stPlay",
    stPause = "stPause",
}

//id кнопок
enum BtnType {
    btnRain = "btnRain",
    btnSun  = "btnSun",
    btnSnow = "btnSnow",
}

//интерфейс для кнопки
interface SchemaMedia {
    image:  string;
    icon:   string;
    music:  string;
}

//тип для структуры хранения всех кнопок 
type SchemaMap = {
    [id in BtnType]: SchemaMedia;
}

//описываем кнопки
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

//дефолтная кнопка
const DEFAULT_BTN_ID:   BtnType = BtnType.btnRain;
const DEFAULT_BTN:      SchemaMedia = SCHEMA_MEDIA[DEFAULT_BTN_ID];

//класс кнопки с музыкой
class BtnMusic {
    //кнопка
    #element:   HTMLImageElement;
    //иконка на кнопке, которая может быть заменена на Паузу
    #icon:      string;
    //картинка для фона кнопки и страницы
    #_image:    string;
    //аудиофайл
    #_music:    string;

    //для создания кнопки передаём её id и плеер, к которому будет привязана кнопка
    constructor(public id: BtnType, private currentMusicPlayer: MusicPlayer){
        //по id получаем иконку кнопки из DOM
        this.#element = document.getElementById(id) as HTMLImageElement;
        //инициалтзируем переменные.
        //а дефолтные значения на случай, если с id напутали в разметке
        this.#icon = SCHEMA_MEDIA[id]?.icon || DEFAULT_BTN?.icon;
        this.#_image = SCHEMA_MEDIA[id]?.image || DEFAULT_BTN?.image;
        this.#_music = SCHEMA_MEDIA[id]?.music || DEFAULT_BTN?.music;
        //получаем родительский div для картинки, т.е. для самой кнопки
        const parentDivElement: HTMLDivElement = this.#element.parentNode! as HTMLDivElement;
        //задаём кнопке фон
        parentDivElement.style.backgroundImage = this.#_image;
        //на родительский div навешиваем слушатель клика
        parentDivElement.addEventListener('click', () => {
            //если нажали по кнопке, то в плеере -
            //который передали в конструктор "currentMusicPlayer: MusicPlayer"- 
            //будем указывать эту кнопку как активную 
            currentMusicPlayer.CurrentBtn = this as unknown as BtnMusic;
        }
        )
    }

    //вызывается из "currentMusicPlayer: MusicPlayer".
    //функция задаёт икону кнопки
    public setStatusMusic(newStatusMusic: StatusMusic): void{
        switch(newStatusMusic){
            case StatusMusic.stPause: 
                this.#element!.src = ICON_PAUSE;
                break;
            case StatusMusic.stPlay: 
                this.#element!.src = this.#icon;
                break;
        }
    }

    public get image(): string{
        return this.#_image;
    } 

    public get music(): string{
        return this.#_music;
    } 
}

//класс плеера, который управляет воспроизведением
class MusicPlayer {
    //аудиоплеер
    #audioPlayer:   HTMLMediaElement;
    //фон странцы
    #container:     HTMLDivElement;
    //активная кнопка (последняя нажатая)
    #_currentBtn:   BtnMusic | null = null;

    constructor(){
        //получаем аудиоплеер
        this.#audioPlayer = document.getElementById("audioPlayer") as HTMLMediaElement;
        //получаем div для смены фона
        this.#container =   document.getElementById("container") as HTMLDivElement;
        //получаем регулятор громкости и после навешивания события забываем про него
        const volume: HTMLInputElement = document.getElementById("volume-input") as HTMLInputElement;
        //навешиваем слушатель на решулятор громкости
        volume.addEventListener('input', (event: Event) => {
            //присваиваем значение громкости аудиоплееру из регулятора громкости
            this.#audioPlayer.volume = Number((event.target as HTMLInputElement).value) / 100;
        })
    }

    //функция запоминает последнюю нажатую кнопку.
    //(вызывается из события нажатия кнопки BtnMusic,
    //аргументом передаётся сама нажатая кнопка)
    public set CurrentBtn(newBtn: BtnMusic){
        //если нажата не та кнопка, которая была нажата последний раз
        if(newBtn !== this.#_currentBtn){
            //если нажимаем на кнопку не первый раз
            if(this.#_currentBtn){
                //то ранее нажатой кнопке возвращаем родную иконку (не паузу)
                this.#_currentBtn.setStatusMusic(StatusMusic.stPlay);
            }
            //запоминаем новую нажатую кнопу
            this.#_currentBtn = newBtn;
            //меняем фон
            this.#container.style.backgroundImage = this.#_currentBtn.image;
            //новой нажатой кнопке устанавливаем родную иконку (не паузу)
            this.#_currentBtn.setStatusMusic(StatusMusic.stPlay);
            //аудиоплееру указываем новую мелодию 
            this.#audioPlayer!.src = this.#_currentBtn.music;
            //и если плеер на паузе, то запускаем его
            if(this.#audioPlayer?.paused){
                this.#audioPlayer.play();
            }
        }else{//если второй и более раз подряд нажимаем на одну кнопку.
            //то в зависимости от статуса плеера меняем 
            //только иконку и сам статус
            if(!this.#audioPlayer!.paused){
                this.#_currentBtn.setStatusMusic(StatusMusic.stPause);
                this.#audioPlayer!.pause();
            }else{
                this.#_currentBtn.setStatusMusic(StatusMusic.stPlay);
                this.#audioPlayer!.play();
            }
        }
    }
}

//1.создаём плеер
const musicPlayer: MusicPlayer = new MusicPlayer();

//2.создаём "кнопки" - элементы, содержащие информацию о проигрываемых файлах и картинках.
//2.1.Получаем иконки кнопок из DOM по классу.
const btnsMusic: HTMLCollectionOf<HTMLImageElement> | null = document.getElementsByClassName("btnMusic") as HTMLCollectionOf<HTMLImageElement> | null;
//2.2. создаём сами объекты-кнопки: преобразуем коллекцию в массив элементов,
//у каждого элемента берём id и создаём объекты BtnMusic
[].slice.call(btnsMusic)?.map((item: HTMLImageElement) => new BtnMusic(item!.id as BtnType, musicPlayer))
// ( да, тут немного тупо выглядит, т.к. сначаламы получаем коллекцию иконок пот классу, 
//чтоб взять из коллекции только id, затем передать id в конструктор кнопки и там снова
//получить этот же элемент уже по id.
//но мне показалось, что лучше создавать кнопку по идентификатору,
//чем передавать в конструктор элемент, у которого потом будет извлекаться id в конструкторе ).


