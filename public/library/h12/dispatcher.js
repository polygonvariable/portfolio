class Dispatcher  {
    
    #listeners = new Map();

    on(event, listener) {
        if (!this.#listeners.has(event)) {
            this.#listeners.set(event, []);
        }
        this.#listeners.get(event).push(listener);
    }
    off(event, listener) {
        if (this.#listeners.has(event)) {
            this.#listeners.set(event, this.#listeners.get(event).filter((l) => l !== listener));
        }
    }
    emit(event, ... args) {
        if (this.#listeners.has(event)) {
            this.#listeners.get(event).forEach((listener) => listener(... args));
        }
    }
    once(event, listener) {
        const wrapper = (... args) => {
            this.off(event, wrapper);
            listener(... args);
        };
        this.on(event, wrapper);
    }
    clear(event) {
        if (this.#listeners.has(event)) {
            this.#listeners.delete(event);
        }
    }
    clearAll() {
        this.#listeners.clear();
    }
}

export { Dispatcher }