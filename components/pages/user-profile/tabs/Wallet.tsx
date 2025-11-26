'use client';

import { useState, useEffect } from 'react';
import styles from './Wallet.module.css';

export default function Wallet() {
  const [financialData, setFinancialData] = useState({
    totalBalance: 0,
    pendingBalance: 0,
    availableBalance: 0,
    transactions: [] as {
      id: number;
      type: string;
      amount: number;
      date: string;
      time: string;
      description: string;
      cardNumber: string;
    }[],
  });

  useEffect(() => {
    // Match Angular hardcoded placeholder data (until wallet API is connected)
    setFinancialData({
      totalBalance: 250,
      pendingBalance: 100,
      availableBalance: 150,
      transactions: [
        {
          id: 1,
          type: 'payment',
          amount: 150,
          date: '20/1/28',
          time: '12:39am',
          description: 'دفع مبلغ 150 ليرة لترقية باقة شهرية',
          cardNumber: '8876 5567 5543 3324',
        },
        {
          id: 2,
          type: 'payment',
          amount: 150,
          date: '20/1/28',
          time: '12:39am',
          description: 'دفع مبلغ 150 ليرة لترقية باقة شهرية',
          cardNumber: '8876 5567 5543 3324',
        },
        {
          id: 3,
          type: 'payment',
          amount: 150,
          date: '20/1/28',
          time: '12:39am',
          description: 'دفع مبلغ 150 ليرة لترقية باقة شهرية',
          cardNumber: '8876 5567 5543 3324',
        },
      ],
    });
  }, []);

  return (
    <div className={styles.walletTab}>
      <div className={styles.balanceSection}>
        <div className="row">
          <div className="col-md-4 mb-3">
            <div className={`${styles.balanceCard} ${styles.total}`}>
              <div className={styles.balanceTitle}>الرصيد الكلي</div>
              <div className={styles.balanceAmount}>{financialData.totalBalance} ليرة</div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className={`${styles.balanceCard} ${styles.pending}`}>
              <div className={styles.balanceTitle}>الرصيد المعلق</div>
              <div className={styles.balanceAmount}>{financialData.pendingBalance} ليرة</div>
            </div>
          </div>
          <div className="col-md-4 mb-3">
            <div className={`${styles.balanceCard} ${styles.available}`}>
              <div className={styles.balanceTitle}>رصيد يمكن سحبه</div>
              <div className={styles.balanceAmount}>{financialData.availableBalance} ليرة</div>
            </div>
          </div>
        </div>
      </div>

      <div className={styles.transactionsSection}>
        <h3 className={styles.sectionTitle}>سجل المعاملات المالية</h3>
        {financialData.transactions.length === 0 ? (
          <div className="alert alert-info text-center">لا توجد معاملات متاحة</div>
        ) : (
          <div className={styles.transactionList}>
            {financialData.transactions.map((transaction) => (
              <div key={transaction.id} className={styles.transactionItem}>
                <div className="row align-items-center">
                  <div className="col-md-3">
                    <div className={`${styles.transactionAmount} ${styles.negative}`}>
                      - {transaction.amount} ليرة
                    </div>
                  </div>
                  <div className="col-md-5">
                    <div className={styles.transactionDetails}>
                      <div className={styles.transactionType}>{transaction.description}</div>
                      <div className={styles.transactionDescription}></div>
                      <div className={styles.transactionId}>
                        رقم العملية: #{transaction.id} | {transaction.time}، {transaction.date}
                      </div>
                    </div>
                  </div>
                  <div className="col-md-4">
                    <div className={styles.visaCard}>
                      <div className={styles.cardInfo}>
                        <div className={styles.visa}>
                          <div className={styles.paymentText}>الدفع</div>
                          <img
                            className={styles.cardLogo}
                            src="/assets/images/visa-logo.png"
                            alt="Visa Logo"
                            loading="lazy"
                          />
                        </div>
                        <div className={styles.cardNumber}>رقم البطاقة: {transaction.cardNumber}</div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
