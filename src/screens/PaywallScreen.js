import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
  Alert
} from 'react-native';
import Purchases from 'react-native-purchases';
import { getAgeConfig, getScaledSize } from '../utils/constants';
import { t } from '../utils/i18n';

export default function PaywallScreen({ navigation, route }) {
  const [offerings, setOfferings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [purchasing, setPurchasing] = useState(false);
  const ageGroup = route.params?.ageGroup || 'elementary';
  const config = getAgeConfig(ageGroup);

  useEffect(() => {
    loadOfferings();
  }, []);

  const loadOfferings = async () => {
    try {
      const offerings = await Purchases.getOfferings();
      if (offerings.current !== null) {
        setOfferings(offerings.current);
      }
      setLoading(false);
    } catch (e) {
      console.log('Error loading offerings:', e);
      setLoading(false);
    }
  };

  const purchasePackage = async (packageItem) => {
    setPurchasing(true);
    try {
      const { customerInfo } = await Purchases.purchasePackage(packageItem);
      if (customerInfo.entitlements.active['premium']) {
        Alert.alert('Success!', 'Welcome to Study Buddy Premium!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      }
    } catch (e) {
      if (!e.userCancelled) {
        Alert.alert('Error', 'Purchase failed. Please try again.');
      }
    }
    setPurchasing(false);
  };

  const restorePurchases = async () => {
    setPurchasing(true);
    try {
      const customerInfo = await Purchases.restorePurchases();
      if (customerInfo.entitlements.active['premium']) {
        Alert.alert('Success!', 'Your purchase has been restored!', [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('No Purchases', 'No previous purchases found.');
      }
    } catch (e) {
      Alert.alert('Error', 'Could not restore purchases.');
    }
    setPurchasing(false);
  };

  if (loading) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: config.secondaryColor }]}>
        <ActivityIndicator size="large" color={config.primaryColor} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: config.secondaryColor }]}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Header */}
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.closeButton}>
          <Text style={styles.closeText}>✕</Text>
        </TouchableOpacity>

        {/* Title */}
        <Text style={[styles.title, { color: config.primaryColor }]}>
          Study Buddy Premium
        </Text>

        {/* Benefits */}
        <View style={styles.benefitsContainer}>
          <Text style={styles.benefitTitle}>Unlock Everything:</Text>
          {[
            '✓ Unlimited study sessions',
            '✓ All buddy characters',
            '✓ Custom encouragement messages',
            '✓ Detailed progress reports',
            '✓ Photo history gallery',
            '✓ Ad-free forever'
          ].map((benefit, index) => (
            <Text key={index} style={styles.benefitItem}>{benefit}</Text>
          ))}
        </View>

        {/* Packages */}
        {offerings && offerings.availablePackages.map((pkg) => (
          <TouchableOpacity
            key={pkg.identifier}
            style={[
              styles.packageButton,
              { backgroundColor: config.primaryColor }
            ]}
            onPress={() => purchasePackage(pkg)}
            disabled={purchasing}
          >
            <Text style={styles.packageTitle}>{pkg.product.title}</Text>
            <Text style={styles.packagePrice}>
              {pkg.product.priceString}
              {pkg.packageType === 'MONTHLY' && '/month'}
              {pkg.packageType === 'ANNUAL' && '/year'}
            </Text>
            {pkg.packageType === 'ANNUAL' && (
              <Text style={styles.savingsText}>Save 33%!</Text>
            )}
          </TouchableOpacity>
        ))}

        {/* Restore Button */}
        <TouchableOpacity
          style={styles.restoreButton}
          onPress={restorePurchases}
          disabled={purchasing}
        >
          <Text style={styles.restoreText}>Restore Purchases</Text>
        </TouchableOpacity>

        {/* Terms */}
        <Text style={styles.terms}>
          Subscriptions auto-renew. Cancel anytime in app store settings.
        </Text>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    padding: 20,
    alignItems: 'center',
  },
  closeButton: {
    alignSelf: 'flex-end',
    padding: 10,
  },
  closeText: {
    fontSize: 24,
    color: '#7F8C8D',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  benefitsContainer: {
    backgroundColor: 'white',
    borderRadius: 15,
    padding: 20,
    marginBottom: 30,
    width: '100%',
  },
  benefitTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 15,
    textAlign: 'center',
  },
  benefitItem: {
    fontSize: 16,
    marginBottom: 10,
    color: '#2C3E50',
  },
  packageButton: {
    borderRadius: 15,
    padding: 20,
    marginBottom: 15,
    width: '100%',
    alignItems: 'center',
  },
  packageTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: 'white',
    marginBottom: 5,
  },
  packagePrice: {
    fontSize: 24,
    color: 'white',
    fontWeight: 'bold',
  },
  savingsText: {
    fontSize: 14,
    color: '#FFE5B4',
    marginTop: 5,
  },
  restoreButton: {
    marginTop: 20,
    padding: 15,
  },
  restoreText: {
    fontSize: 16,
    color: '#3498DB',
    textDecorationLine: 'underline',
  },
  terms: {
    fontSize: 12,
    color: '#7F8C8D',
    textAlign: 'center',
    marginTop: 20,
    paddingHorizontal: 20,
  },
});
