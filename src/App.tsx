import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ProductProvider } from './context/ProductContext';
import { NotificationProvider, useNotifications } from './context/NotificationContext';
import { ToastProvider } from './context/ToastContext';
import { MobileDeviceFrame } from './components/ui/MobileDeviceFrame';
import { BottomTabBar, TabKey } from './components/navigation/BottomTabBar';
import { PushNotificationBanner } from './components/ui/PushNotificationBanner';

// Screens
import { OnboardingScreen } from './screens/OnboardingScreen';
import { LoginScreen } from './screens/LoginScreen';
import { SignupScreen } from './screens/SignupScreen';
import { ForgotPasswordScreen } from './screens/ForgotPasswordScreen';
import { HomeScreen } from './screens/HomeScreen';
import { ProductsScreen } from './screens/ProductsScreen';
import { AddProductScreen } from './screens/AddProductScreen';
import { ProductDetailScreen } from './screens/ProductDetailScreen';
import { EditProductScreen } from './screens/EditProductScreen';
import { RemindersScreen } from './screens/RemindersScreen';
import { ProfileScreen } from './screens/ProfileScreen';

// Modals
import { NotificationsModal } from './components/modals/NotificationsModal';
import { NotificationPermissionModal } from './components/modals/NotificationPermissionModal';
import { AIScannerModal } from './components/modals/AIScannerModal';
import { ExtractedReceiptData } from './services/aiScannerService';

type AppView = 
  | 'onboarding'
  | 'login'
  | 'signup'
  | 'forgot_password'
  | 'main'
  | 'product_detail'
  | 'edit_product';

const AppNavigator: React.FC = () => {
  const { isAuthenticated, isOnboardingCompleted, completeOnboarding } = useAuth();
  const { 
    activeBanner, 
    dismissBanner, 
    isPermissionModalOpen, 
    closePermissionModal, 
    requestPermission 
  } = useNotifications();

  // Navigation State
  const [currentView, setCurrentView] = useState<AppView>(() => {
    if (!isOnboardingCompleted) return 'onboarding';
    if (!isAuthenticated) return 'login';
    return 'main';
  });

  const [activeTab, setActiveTab] = useState<TabKey>('home');
  const [selectedProductId, setSelectedProductId] = useState<string | null>(null);
  const [aiPrefillData, setAiPrefillData] = useState<Partial<ExtractedReceiptData> | null>(null);

  // Global Modals State
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isAIScannerOpen, setIsAIScannerOpen] = useState(false);

  // Sync currentView if auth state updates
  useEffect(() => {
    if (isAuthenticated && (currentView === 'login' || currentView === 'signup' || currentView === 'forgot_password')) {
      setCurrentView('main');
    }
  }, [isAuthenticated, currentView]);

  // Handle Tab changes
  const handleSelectTab = (tab: TabKey) => {
    setActiveTab(tab);
    setCurrentView('main');
  };

  // View Product details
  const handleSelectProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('product_detail');
  };

  // Edit Product
  const handleEditProduct = (productId: string) => {
    setSelectedProductId(productId);
    setCurrentView('edit_product');
  };

  return (
    <MobileDeviceFrame>
      <div className="w-full h-full flex flex-col bg-brand-bg relative overflow-hidden select-none">
        {/* In-App Floating Push Notification Alert Banner */}
        <PushNotificationBanner
          notification={activeBanner}
          onDismiss={dismissBanner}
          onTap={(productId) => {
            if (productId) {
              handleSelectProduct(productId);
            } else {
              setIsNotificationsOpen(true);
            }
          }}
        />

        {/* Dynamic Screen View */}
        <div className="flex-1 overflow-hidden relative">
          {currentView === 'onboarding' && (
            <OnboardingScreen
              onComplete={() => {
                completeOnboarding();
                setCurrentView(isAuthenticated ? 'main' : 'login');
              }}
              onGoToLogin={() => {
                completeOnboarding();
                setCurrentView('login');
              }}
            />
          )}

          {currentView === 'login' && (
            <LoginScreen
              onGoToSignup={() => setCurrentView('signup')}
              onGoToForgotPassword={() => setCurrentView('forgot_password')}
              onLoginSuccess={() => setCurrentView('main')}
            />
          )}

          {currentView === 'signup' && (
            <SignupScreen
              onGoToLogin={() => setCurrentView('login')}
              onSignupSuccess={() => setCurrentView('main')}
            />
          )}

          {currentView === 'forgot_password' && (
            <ForgotPasswordScreen
              onGoToLogin={() => setCurrentView('login')}
            />
          )}

          {currentView === 'product_detail' && selectedProductId && (
            <ProductDetailScreen
              productId={selectedProductId}
              onBack={() => setCurrentView('main')}
              onEdit={(id) => handleEditProduct(id)}
              onDeleted={() => {
                setSelectedProductId(null);
                setCurrentView('main');
                setActiveTab('products');
              }}
            />
          )}

          {currentView === 'edit_product' && selectedProductId && (
            <EditProductScreen
              productId={selectedProductId}
              onSuccess={() => setCurrentView('product_detail')}
              onCancel={() => setCurrentView('product_detail')}
            />
          )}

          {currentView === 'main' && (
            <>
              {activeTab === 'home' && (
                <HomeScreen
                  onSelectProduct={handleSelectProduct}
                  onGoToProducts={() => setActiveTab('products')}
                  onGoToAdd={() => setActiveTab('add')}
                  onGoToReminders={() => setActiveTab('reminders')}
                  onOpenNotifications={() => setIsNotificationsOpen(true)}
                  onOpenAIScanner={() => setIsAIScannerOpen(true)}
                />
              )}

              {activeTab === 'products' && (
                <ProductsScreen
                  onSelectProduct={handleSelectProduct}
                  onGoToAdd={() => setActiveTab('add')}
                />
              )}

              {activeTab === 'add' && (
                <AddProductScreen
                  initialData={aiPrefillData}
                  onSuccess={(newId) => {
                    setAiPrefillData(null);
                    handleSelectProduct(newId);
                  }}
                  onCancel={() => {
                    setAiPrefillData(null);
                    setActiveTab('home');
                  }}
                  onOpenAIScanner={() => setIsAIScannerOpen(true)}
                />
              )}

              {activeTab === 'reminders' && (
                <RemindersScreen
                  onSelectProduct={handleSelectProduct}
                  onGoToAdd={() => setActiveTab('add')}
                />
              )}

              {activeTab === 'profile' && (
                <ProfileScreen
                  onLogout={() => {
                    setCurrentView('login');
                  }}
                  onReplayOnboarding={() => {
                    setCurrentView('onboarding');
                  }}
                />
              )}
            </>
          )}
        </div>

        {/* Bottom Tab Bar (shown when in authenticated main tabs) */}
        {isAuthenticated && currentView === 'main' && (
          <BottomTabBar
            activeTab={activeTab}
            onSelectTab={handleSelectTab}
          />
        )}

        {/* Global Notifications Modal */}
        <NotificationsModal
          isOpen={isNotificationsOpen}
          onClose={() => setIsNotificationsOpen(false)}
          onSelectProduct={handleSelectProduct}
        />

        {/* Global Notification Permission Prompt Modal */}
        <NotificationPermissionModal
          isOpen={isPermissionModalOpen}
          onClose={closePermissionModal}
          onAllow={requestPermission}
        />

        {/* Global AI Scanner Modal */}
        <AIScannerModal
          isOpen={isAIScannerOpen}
          onClose={() => setIsAIScannerOpen(false)}
          onProductCreated={(newId) => {
            setIsAIScannerOpen(false);
            handleSelectProduct(newId);
          }}
          onOpenInFullForm={(extracted) => {
            setAiPrefillData(extracted);
            setIsAIScannerOpen(false);
            setActiveTab('add');
            setCurrentView('main');
          }}
        />
      </div>
    </MobileDeviceFrame>
  );
};

export const App: React.FC = () => {
  return (
    <ToastProvider>
      <AuthProvider>
        <ProductProvider>
          <NotificationProvider>
            <AppNavigator />
          </NotificationProvider>
        </ProductProvider>
      </AuthProvider>
    </ToastProvider>
  );
};

export default App;
