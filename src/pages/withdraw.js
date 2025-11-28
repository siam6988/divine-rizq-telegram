// Withdraw Page Component
async function loadWithdrawPage() {
    const userData = await getUserData(window.currentUser.uid);
    const withdrawHistory = await getWithdrawHistory();
    
    return `
        <div class="page active" id="withdraw-page">
            <div class="card text-center">
                <h2 class="text-green">💳 উত্তোলন করুন</h2>
                <div style="font-size: 2rem; font-weight: bold; color: var(--gold); margin: 1rem 0;">
                    ${userData.balance || 0} ISLM
                </div>
                <p>উত্তোলনযোগ্য ব্যালেন্স</p>
            </div>

            <!-- Withdrawal Form -->
            <div class="card">
                <h3 class="card-title">উত্তোলন ফর্ম</h3>
                
                <div class="form-group">
                    <label class="form-label">উত্তোলন পরিমাণ (ISLM)</label>
                    <input type="number" class="form-input" id="withdraw-amount" 
                           placeholder="ন্যূনতম 28 ISLM" min="28" max="${userData.balance || 0}" 
                           step="0.1">
                    <small>ন্যূনতম উত্তোলন: 28 ISLM</small>
                </div>

                <div class="form-group">
                    <label class="form-label">উত্তোলন মেথড</label>
                    <select class="form-input" id="withdraw-method">
                        <option value="metamask">MetaMask (ISLM)</option>
                        <option value="binance">Binance Pay</option>
                        <option value="bkash">bKash (BDT)</option>
                        <option value="nagad">Nagad (BDT)</option>
                        <option value="rocket">Rocket (BDT)</option>
                    </select>
                </div>

                <div class="form-group" id="address-field">
                    <label class="form-label" id="address-label">MetaMask Address</label>
                    <input type="text" class="form-input" id="withdraw-address" 
                           placeholder="0x... আপনার MetaMask ঠিকানা">
                </div>

                <!-- Fee Calculation -->
                <div class="card" style="background: #f8f9fa; margin: 1rem 0;">
                    <h4>উত্তোলন সারাংশ</h4>
                    <div style="display: flex; justify-content: space-between; margin: 0.5rem 0;">
                        <span>উত্তোলন পরিমাণ:</span>
                        <span id="summary-amount">0 ISLM</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 0.5rem 0;">
                        <span>প্রক্রিয়াকরণ ফি:</span>
                        <span id="summary-fee">0 ISLM (0%)</span>
                    </div>
                    <div style="display: flex; justify-content: space-between; margin: 0.5rem 0; font-weight: bold;">
                        <span>প্রাপ্ত অর্থ:</span>
                        <span id="summary-total">0 ISLM</span>
                    </div>
                </div>

                <button class="btn btn-gold btn-block" onclick="submitWithdrawal()" id="submit-withdraw">
                    উত্তোলন রিকুয়েস্ট করুন
                </button>
            </div>

            <!-- Withdrawal Information -->
            <div class="card">
                <h3 class="card-title">ℹ️ উত্তোলন তথ্য</h3>
                <ul style="padding-left: 1.5rem;">
                    <li><strong>ন্যূনতম উত্তোলন:</strong> 28 ISLM</li>
                    <li><strong>প্রক্রিয়াকরণ সময়:</strong> 24-48 ঘন্টা</li>
                    <li><strong>উত্তোলন ফি:</strong> প্রথম উত্তোলনে 0%</li>
                    <li><strong>রেফারেল বোনাস:</strong> প্রথম উত্তোলনে 10% এক্সট্রা</li>
                    <li><strong>দৈনিক লিমিট:</strong> 500 ISLM</li>
                </ul>
            </div>

            <!-- Withdrawal History -->
            <div class="card">
                <h3 class="card-title">📋 উত্তোলন ইতিহাস</h3>
                <div id="withdraw-history">
                    ${withdrawHistory}
                </div>
            </div>

            <!-- Referral Bonus Info -->
            ${await getReferralBonusInfo()}
        </div>
    `;
}

// Update address field based on method
document.addEventListener('DOMContentLoaded', function() {
    // This will be called when withdraw page loads
    const methodSelect = document.getElementById('withdraw-method');
    const addressField = document.getElementById('address-field');
    const addressLabel = document.getElementById('address-label');
    const addressInput = document.getElementById('withdraw-address');
    
    if (methodSelect) {
        methodSelect.addEventListener('change', function() {
            updateAddressField(this.value);
        });
    }
    
    // Update amount summary
    const amountInput = document.getElementById('withdraw-amount');
    if (amountInput) {
        amountInput.addEventListener('input', updateWithdrawalSummary);
    }
});

function updateAddressField(method) {
    const addressLabel = document.getElementById('address-label');
    const addressInput = document.getElementById('withdraw-address');
    
    const fields = {
        'metamask': { label: 'MetaMask Address', placeholder: '0x... আপনার MetaMask ঠিকানা' },
        'binance': { label: 'Binance Pay ID', placeholder: 'আপনার Binance Pay ID' },
        'bkash': { label: 'bKash Number', placeholder: '01XXXXXXXXX' },
        'nagad': { label: 'Nagad Number', placeholder: '01XXXXXXXXX' },
        'rocket': { label: 'Rocket Number', placeholder: '01XXXXXXXXX' }
    };
    
    if (fields[method]) {
        addressLabel.textContent = fields[method].label;
        addressInput.placeholder = fields[method].placeholder;
    }
}

function updateWithdrawalSummary() {
    const amount = parseFloat(document.getElementById('withdraw-amount').value) || 0;
    const fee = calculateWithdrawalFee(amount);
    const total = amount - fee;
    
    document.getElementById('summary-amount').textContent = amount.toFixed(2) + ' ISLM';
    document.getElementById('summary-fee').textContent = fee.toFixed(2) + ' ISLM (0%)';
    document.getElementById('summary-total').textContent = total.toFixed(2) + ' ISLM';
}

function calculateWithdrawalFee(amount) {
    // First withdrawal is free
    return 0;
}

async function getWithdrawHistory() {
    const user = window.currentUser;
    if (!user) return '<p>লগইন প্রয়োজন</p>';
    
    try {
        const snapshot = await db.collection('withdrawRequests')
            .where('userId', '==', user.uid)
            .orderBy('timestamp', 'desc')
            .limit(5)
            .get();
        
        if (snapshot.empty) {
            return '<p>আপনার এখনও কোন উত্তোলন রিকুয়েস্ট নেই</p>';
        }
        
        let html = '';
        snapshot.forEach(doc => {
            const request = doc.data();
            const statusColor = getStatusColor(request.status);
            const statusText = getStatusText(request.status);
            
            html += `
                <div style="padding: 0.75rem; border: 1px solid #e0e0e0; border-radius: 8px; margin-bottom: 0.5rem;">
                    <div style="display: flex; justify-content: space-between; align-items: center;">
                        <div>
                            <strong>${request.amount} ISLM</strong>
                            <div style="font-size: 0.8rem; color: #666;">
                                ${request.method} • ${request.timestamp?.toDate().toLocaleDateString('bn-BD')}
                            </div>
                        </div>
                        <div style="color: ${statusColor}; font-weight: 500;">
                            ${statusText}
                        </div>
                    </div>
                    ${request.transactionHash ? `
                        <div style="font-size: 0.8rem; margin-top: 0.5rem;">
                            TX: ${request.transactionHash}
                        </div>
                    ` : ''}
                </div>
            `;
        });
        return html;
    } catch (error) {
        return '<p>ইতিহাস লোড করতে সমস্যা</p>';
    }
}

function getStatusColor(status) {
    const colors = {
        'pending': '#ffc107',
        'approved': '#28a745',
        'processing': '#17a2b8',
        'completed': '#28a745',
        'rejected': '#dc3545'
    };
    return colors[status] || '#666';
}

function getStatusText(status) {
    const texts = {
        'pending': '⏳ পেন্ডিং',
        'approved': '✅ অ্যাপ্রুভড',
        'processing': '🔄 প্রসেসিং',
        'completed': '✅ কমপ্লিট',
        'rejected': '❌ রিজেক্টেড'
    };
    return texts[status] || status;
}

async function getReferralBonusInfo() {
    const user = window.currentUser;
    if (!user) return '';
    
    try {
        const userDoc = await db.collection('users').doc(user.uid).get();
        const userData = userDoc.data();
        
        if (userData && !userData.hasWithdrawn) {
            return `
                <div class="card" style="background: linear-gradient(135deg, var(--gold), var(--light-gold)); color: var(--primary-green);">
                    <h3 class="card-title">🎉 বিশেষ অফার!</h3>
                    <p>আপনার প্রথম উত্তোলনে পাবেন <strong>১০% এক্সট্রা বোনাস</strong>!</p>
                    <p><small>এই অফার শুধুমাত্র প্রথম উত্তোলনের জন্য</small></p>
                </div>
            `;
        }
    } catch (error) {
        console.error('Error checking referral bonus:', error);
    }
    
    return '';
}

async function submitWithdrawal() {
    const user = window.currentUser;
    if (!user) {
        alert('লগইন প্রয়োজন');
        return;
    }
    
    const amount = parseFloat(document.getElementById('withdraw-amount').value);
    const method = document.getElementById('withdraw-method').value;
    const address = document.getElementById('withdraw-address').value.trim();
    
    // Validation
    if (!amount || amount < 28) {
        alert('ন্যূনতম 28 ISLM উত্তোলন করতে হবে');
        return;
    }
    
    if (!address) {
        alert('উত্তোলনের ঠিকানা দিন');
        return;
    }
    
    const userData = await getUserData(user.uid);
    if (amount > userData.balance) {
        alert('পর্যাপ্ত ব্যালেন্স নেই');
        return;
    }
    
    try {
        // Create withdrawal request
        await db.collection('withdrawRequests').add({
            userId: user.uid,
            amount: amount,
            method: method,
            address: address,
            status: 'pending',
            timestamp: firebase.firestore.FieldValue.serverTimestamp(),
            userAgent: navigator.userAgent
        });
        
        // Update user balance
        await updateUserBalance(user.uid, -amount, 'withdrawal');
        
        // Mark user as having withdrawn
        await db.collection('users').doc(user.uid).update({
            hasWithdrawn: true,
            lastWithdrawAttempt: firebase.firestore.FieldValue.serverTimestamp()
        });
        
        alert('✅ উত্তোলন রিকুয়েস্ট সফলভাবে জমা হয়েছে! 24-48 ঘন্টার মধ্যে প্রসেস করা হবে।');
        window.navigateTo('wallet');
        
    } catch (error) {
        console.error('Error submitting withdrawal:', error);
        alert('উত্তোলন রিকুয়েস্ট জমা করতে সমস্যা হচ্ছে।');
    }
}
