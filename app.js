class KawaiiTodoDApp {
    constructor() {
        this.contract = null;
        this.currentAccount = null;
        this.selectedPriority = null;
        this.currentFilter = 'all';
        
        // 🎯 CONTRACT ADDRESS - Double check this!
        this.contractAddress = '0xd9145CCE52D386f254917e481eB44e9943F39138';
        this.contractABI = [
            {
                "inputs": [
                    {
                        "internalType": "string",
                        "name": "_description",
                        "type": "string"
                    },
                    {
                        "internalType": "uint256",
                        "name": "_priority",
                        "type": "uint256"
                    }
                ],
                "name": "addTask",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getAllTasks",
                "outputs": [
                    {
                        "components": [
                            {
                                "internalType": "uint256",
                                "name": "taskId",
                                "type": "uint256"
                            },
                            {
                                "internalType": "string",
                                "name": "description",
                                "type": "string"
                            },
                            {
                                "internalType": "uint256",
                                "name": "priority",
                                "type": "uint256"
                            },
                            {
                                "internalType": "bool",
                                "name": "isCompleted",
                                "type": "bool"
                            }
                        ],
                        "internalType": "struct TaskPrioritizer.Task[]",
                        "name": "",
                        "type": "tuple[]"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [],
                "name": "getTaskCount",
                "outputs": [
                    {
                        "internalType": "uint256",
                        "name": "",
                        "type": "uint256"
                    }
                ],
                "stateMutability": "view",
                "type": "function"
            },
            {
                "inputs": [
                    {
                        "internalType": "uint256",
                        "name": "_taskId",
                        "type": "uint256"
                    }
                ],
                "name": "markCompleted",
                "outputs": [],
                "stateMutability": "nonpayable",
                "type": "function"
            }
        ];

        console.log('🔧 DEBUG: Constructor called');
        console.log('🔧 DEBUG: Contract address:', this.contractAddress);
        this.init();
    }

    async init() {
        console.log('🔧 DEBUG: init() called');
        this.bindEvents();
        
        // Check connection
        await this.checkConnection();
    }

    bindEvents() {
        console.log('🔧 DEBUG: Binding events');
        
        document.getElementById('connectWallet').addEventListener('click', () => {
            console.log('🔧 DEBUG: Connect wallet clicked');
            this.connectWallet();
        });
        
        document.getElementById('addTaskBtn').addEventListener('click', () => {
            console.log('🔧 DEBUG: Add task clicked');
            console.log('🔧 DEBUG: Current contract:', this.contract);
            console.log('🔧 DEBUG: Current account:', this.currentAccount);
            this.addTask();
        });
        
        document.querySelectorAll('.priority-btn').forEach(btn => {
            btn.addEventListener('click', (e) => {
                const button = e.target.closest('.priority-btn');
                console.log('🔧 DEBUG: Priority selected:', button.dataset.priority);
                this.selectPriority(button);
            });
        });
    }

    async checkConnection() {
        console.log('🔧 DEBUG: checkConnection() called');
        
        if (typeof window.ethereum === 'undefined') {
            console.log('❌ DEBUG: MetaMask not found');
            this.showStatus('Please install MetaMask! 🦊', 'error');
            return;
        }

        try {
            console.log('🔧 DEBUG: Checking for accounts...');
            const accounts = await window.ethereum.request({ method: 'eth_accounts' });
            console.log('🔧 DEBUG: Accounts found:', accounts);
            
            if (accounts.length > 0) {
                console.log('✅ DEBUG: Wallet connected:', accounts[0]);
                await this.setupContract(accounts[0]);
            } else {
                console.log('🔧 DEBUG: No accounts connected');
                this.updateUI(false);
            }
        } catch (error) {
            console.error('🔧 DEBUG: Connection check error:', error);
        }
    }

    async connectWallet() {
        console.log('🔧 DEBUG: connectWallet() called');
        
        try {
            console.log('🔧 DEBUG: Requesting accounts...');
            const accounts = await window.ethereum.request({ 
                method: 'eth_requestAccounts' 
            });
            
            console.log('🔧 DEBUG: Accounts received:', accounts);
            
            if (accounts.length > 0) {
                await this.setupContract(accounts[0]);
                this.showStatus('Wallet connected! 🎉', 'success');
            }
        } catch (error) {
            console.error('🔧 DEBUG: Wallet connection error:', error);
            this.showStatus('Connection failed 😢', 'error');
        }
    }

    async setupContract(account) {
        console.log('🔧 DEBUG: setupContract() called with account:', account);
        
        try {
            this.currentAccount = account;
            this.updateUI(true, account);

            console.log('🔧 DEBUG: Setting up ethers...');
            const provider = new ethers.providers.Web3Provider(window.ethereum);
            const signer = provider.getSigner();
            
            console.log('🔧 DEBUG: Creating contract instance...');
            this.contract = new ethers.Contract(this.contractAddress, this.contractABI, signer);
            console.log('🔧 DEBUG: Contract instance created:', this.contract);
            
            // Test the contract
            console.log('🔧 DEBUG: Testing contract connection...');
            try {
                const taskCount = await this.contract.getTaskCount();
                console.log('✅ DEBUG: Contract test SUCCESS! Task count:', taskCount.toString());
                this.showStatus('Contract connected! Ready to add tasks 🎊', 'success');
                
            } catch (contractError) {
                console.error('❌ DEBUG: Contract test FAILED:', contractError);
                this.showStatus('Contract connection failed! Check address 🔧', 'error');
            }

        } catch (error) {
            console.error('❌ DEBUG: Contract setup FAILED:', error);
            this.showStatus('Setup failed 😢', 'error');
        }
    }

    updateUI(connected, account = null) {
        console.log('🔧 DEBUG: updateUI() called - connected:', connected, 'account:', account);
        
        const walletBtn = document.getElementById('connectWallet');
        const walletStatus = document.getElementById('walletStatus');
        
        if (connected && account) {
            walletBtn.innerHTML = '<span class="btn-emoji">✅</span><span class="btn-text">Connected</span>';
            walletBtn.disabled = true;
            
            const shortAddress = account.substring(0, 6) + '...' + account.substring(account.length - 4);
            walletStatus.innerHTML = `<span class="status-emoji">🟢</span><span class="status-text">Connected: ${shortAddress}</span>`;
            walletStatus.className = 'wallet-status connected';
        } else {
            walletBtn.innerHTML = '<span class="btn-emoji">👛</span><span class="btn-text">Connect Wallet</span>';
            walletBtn.disabled = false;
            
            walletStatus.innerHTML = '<span class="status-emoji">🔴</span><span class="status-text">Not Connected</span>';
            walletStatus.className = 'wallet-status';
        }
    }

    selectPriority(button) {
        document.querySelectorAll('.priority-btn').forEach(btn => {
            btn.classList.remove('active');
        });
        
        button.classList.add('active');
        this.selectedPriority = parseInt(button.dataset.priority);
        
        const priorityClasses = ['low', 'medium', 'high'];
        const priorityEmojis = ['🐢', '🚶‍♀️', '🚀'];
        const priorityTexts = ['Low Priority', 'Medium Priority', 'High Priority'];
        
        const display = document.getElementById('selectedPriority');
        display.className = `priority-display ${priorityClasses[this.selectedPriority]}`;
        display.innerHTML = `<span class="display-emoji">${priorityEmojis[this.selectedPriority]}</span><span class="display-text">${priorityTexts[this.selectedPriority]}</span>`;
    }

    async addTask() {
        console.log('🎯 DEBUG: addTask() called');
        console.log('🔧 DEBUG: Contract exists?', !!this.contract);
        console.log('🔧 DEBUG: Account exists?', !!this.currentAccount);
        
        // SIMPLE CHECK - This is where the issue is!
        if (!this.contract) {
            console.log('❌ DEBUG: NO CONTRACT - showing error');
            this.showStatus('Please connect your wallet first! 👛', 'error');
            return;
        }

        const taskInput = document.getElementById('taskInput');
        const description = taskInput.value.trim();
        
        if (!description) {
            this.showStatus('Please enter a task description! ✏️', 'error');
            return;
        }

        if (this.selectedPriority === null) {
            this.showStatus('Please select a priority level! 🎯', 'error');
            return;
        }

        try {
            console.log('🔧 DEBUG: Calling contract.addTask()...');
            this.showStatus('Adding task... ⏳', 'info');
            
            const tx = await this.contract.addTask(description, this.selectedPriority);
            console.log('🔧 DEBUG: Transaction sent:', tx.hash);
            
            this.showStatus('Transaction sent! Waiting... ⏳', 'info');
            await tx.wait();
            
            console.log('✅ DEBUG: Task added successfully!');
            this.showStatus('Task added! 🎉', 'success');
            
            // Clear form
            taskInput.value = '';
            document.querySelectorAll('.priority-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            
            this.selectedPriority = null;
            
        } catch (error) {
            console.error('❌ DEBUG: Add task error:', error);
            this.showStatus('Failed to add task 😢', 'error');
        }
    }

    showStatus(message, type) {
        const statusElement = document.getElementById('statusMessage');
        statusElement.textContent = message;
        statusElement.className = `cute-status-message ${type} show`;
        
        setTimeout(() => {
            statusElement.classList.remove('show');
        }, 4000);
    }
}

// Start the app
let app;
window.addEventListener('load', () => {
    console.log('🔧 DEBUG: Page loaded, creating app instance');
    app = new KawaiiTodoDApp();
});