type CallbackFunction = (err: any, node: any) => void;

class JSONDigger {
    public ds: any;
    private ordinalId: string;
    private children: string;
    private count: number;

    constructor(dataSource: any, idProp: string, childrenProp: string) {
        this.ds = dataSource;
        this.ordinalId = idProp;
        this.children = childrenProp;
        this.count = 0;
    }

    // Method to count nodes in the data structure
    private countNodes(node: Record<string, any>): void {
        this.count++;
        if (!node || !Object.keys(node).length) {
            return;
        } else {
            if (node[this.children]) {
                node[this.children].forEach((child: object) => {
                    this.countNodes(child);
                });
            }
        }
    }

    // Method to find a node by its ID
    private findNodeById(id: string): Promise<any> {
        this.countNodes(this.ds);
        return new Promise((resolve, reject) => {
            if (!id) {
                return reject(new Error('Parameter id is invalid.'));
            }

            const findNodeById = (node: Record<string, any>, id: string, callback: CallbackFunction) => {
                if (!this.count) {
                    return;
                }
                if (node[this.ordinalId] === id) {
                    this.count = 0;
                    return callback(null, node);
                } else {
                    if (this.count === 1) {
                        this.count = 0;
                        callback("The node doesn't exist.", null);
                    }
                    this.count--;
                    if (node[this.children]) {
                        node[this.children].forEach((child: object) => {
                            findNodeById(child, id, callback);
                        });
                    }
                }
            };
            findNodeById(this.ds, id, (err: any, node: any) => {
                if (err) {
                    return reject(new Error(err));
                }
                return resolve(node);
            });
        });
    }

    // Method to find the parent of a node
    private findParent(id: string): Promise<any> {
        this.countNodes(this.ds);
        return new Promise((resolve, reject) => {
            if (!id) {
                return reject(new Error('Parameter id is invalid.'));
            }

            const findParent = (node: Record<string, any>, id: string, callback: CallbackFunction) => {
                if (this.count === 1) {
                    this.count = 0;
                    return callback("The node doesn't exist.", null);
                } else {
                    this.count--;
                    if (typeof node[this.children] !== 'undefined') {
                        node[this.children].forEach((child: any) => {
                            if (child[this.ordinalId] === id) {
                                this.count = 0;
                                return callback(null, node);
                            }
                        });
                        node[this.children].forEach((child: any) => {
                            findParent(child, id, callback);
                        });
                    }
                }
            };
            findParent(this.ds, id, (err: any, parent: any) => {
                if (err) {
                    return reject(new Error(err));
                }
                return resolve(parent);
            });
        });
    }

    // Method to validate parameters
    private validateParams(id: string, data: any): void {
        if (!id) {
            throw new Error('Parameter id is invalid.');
        }

        if (
            !data ||
            (data.constructor !== Object && data.constructor !== Array) ||
            (data.constructor === Object && !Object.keys(data).length) ||
            (data.constructor === Array && !data.length) ||
            (data.constructor === Array && data.length && !data.every((item: any) => item && item.constructor === Object && Object.keys(item).length))
        ) {
            throw new Error('Parameter data is invalid.');
        }
    }

    // Method to add children to a node
    async addChildren(id: string, data: any): Promise<void> {
        const newData = { ...data, ordinalParentId: id };
        this.validateParams(id, newData);

        try {
            const parent = await this.findNodeById(id);
            if (newData.constructor === Object) {
                if (parent[this.children]) {
                    (parent[this.children] as object[]).push(newData);
                } else {
                    parent[this.children] = [newData];
                }
            } else {
                if (parent[this.children]) {
                    (parent[this.children] as object[]).push(...newData);
                } else {
                    parent[this.children] = newData;
                }
            }
        } catch (err) {
            throw new Error('Failed to add child nodes.');
        }
    }

    // Method to remove a node
    async removeNode(id: string): Promise<void> {
        if (id === this.ds[this.ordinalId]) {
            throw new Error('Input parameter is invalid.');
        }
        try {
            const parent = await this.findParent(id);
            const index = (parent[this.children] as object[]).findIndex((child: any) => child[this.ordinalId] === id);
            (parent[this.children] as object[]).splice(index, 1);
            this.count = 0;

            return parent;
        } catch (err) {
            throw new Error('Failed to remove node.');
        }
    }
}

export default JSONDigger;
