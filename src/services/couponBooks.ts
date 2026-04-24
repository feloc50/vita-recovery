import { collection, doc, getDoc, getDocs, query, where, addDoc, updateDoc, Timestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { CouponBook, CreateCouponBookData } from '../types/couponBook';

export async function createCouponBook(data: Omit<CreateCouponBookData, 'remainingSessions'>): Promise<string> {
  try {
    const couponBookData = {
      ...data,
      remainingSessions: data.totalSessions,
      status: 'active',
      createdAt: Timestamp.now(),
      updatedAt: Timestamp.now()
    };

    const docRef = await addDoc(collection(db, 'couponBooks'), couponBookData);
    return docRef.id;
  } catch (error) {
    console.error('Error creating coupon book:', error);
    throw error;
  }
}

export async function getCouponBooks(): Promise<CouponBook[]> {
  try {
    console.log('Fetching coupon books...');
    const querySnapshot = await getDocs(collection(db, 'couponBooks'));
    console.log('Number of coupon books found:', querySnapshot.size);
    
    const books = querySnapshot.docs.map(doc => {
      const data = doc.data();
      console.log('Coupon book data:', { id: doc.id, ...data });
      return {
        id: doc.id,
        ...data
      } as CouponBook;
    });
    
    return books;
  } catch (error) {
    console.error('Error getting coupon books:', error);
    throw error;
  }
}

export async function updateCouponBook(id: string, data: Partial<CouponBook>): Promise<void> {
  try {
    const docRef = doc(db, 'couponBooks', id);
    await updateDoc(docRef, {
      ...data,
      updatedAt: Timestamp.now()
    });
  } catch (error) {
    console.error('Error updating coupon book:', error);
    throw error;
  }
}

export async function getCouponBooksByClient(clientId: string): Promise<CouponBook[]> {
  try {
    const q = query(
      collection(db, 'couponBooks'),
      where('clientId', '==', clientId)
    );
    const querySnapshot = await getDocs(q);
    return querySnapshot.docs.map(doc => ({
      id: doc.id,
      ...doc.data()
    } as CouponBook));
  } catch (error) {
    console.error('Error getting client coupon books:', error);
    throw error;
  }
}