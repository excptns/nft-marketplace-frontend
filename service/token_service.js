export class TokenService {
    constructor(httpCaller) {
        this.httpCaller = httpCaller;
        this.endPoint_ = "erc20tokens/"
    }

    createUrl_(url) {
        return this.endPoint_ + url;
    }

    fetchERC20Tokens() {
        const url = this.createUrl_(``);
        return this.httpCaller.get(url);
    }
}