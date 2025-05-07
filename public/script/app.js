import "@style/main.css";
import H12 from "@library/h12";

class App extends H12 {
    constructor() {
        super();
        this.num = 0;
    }
    main(args) {
        const { count } = this.key;
        count(this.num);
    }
    render() {
        return <>
            <div class="w-full h-full overflow-auto scroll relative">
                <div class="h-full p-6 flex flex-col justify-center items-center space-y-1">
                    <label class="text-2xl">Hello World</label>
                    <button onclick={ this.increment } class="bg-zinc-300 px-4 p-1 rounded-md text-sm hover:bg-zinc-200 active:bg-zinc-100">Increment: {count}</button>
                    <svg width="100" height="100">
                        <circle cx="50" cy="50" r={count} stroke="black" stroke-width="2" fill="red" />
                    </svg>
                </div>
            </div>
        </>;
    }
    increment() {
        const { count } = this.key;
        count(++this.num);
    }
};

// Render app
document.querySelector(".app").appendChild(
    new App().init()
);