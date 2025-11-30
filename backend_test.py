import requests
import sys
import json
import time
from datetime import datetime

class ShoeRepairAPITester:
    def __init__(self, base_url="https://cordonnerie-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.tests_run = 0
        self.tests_passed = 0
        self.test_results = []

    def log_test(self, name, success, details=""):
        """Log test result"""
        self.tests_run += 1
        if success:
            self.tests_passed += 1
            print(f"✅ {name} - PASSED")
        else:
            print(f"❌ {name} - FAILED: {details}")
        
        self.test_results.append({
            "test": name,
            "success": success,
            "details": details
        })

    def run_test(self, name, method, endpoint, expected_status, data=None, files=None):
        """Run a single API test"""
        url = f"{self.api_url}/{endpoint}"
        headers = {'Content-Type': 'application/json'}
        if self.token:
            headers['Authorization'] = f'Bearer {self.token}'

        print(f"\n🔍 Testing {name}...")
        print(f"   URL: {url}")
        
        try:
            if files:
                # Remove Content-Type for multipart/form-data
                headers.pop('Content-Type', None)
                
            if method == 'GET':
                response = requests.get(url, headers=headers)
            elif method == 'POST':
                if files:
                    response = requests.post(url, data=data, files=files, headers=headers)
                else:
                    response = requests.post(url, json=data, headers=headers)
            elif method == 'PATCH':
                response = requests.patch(url, json=data, headers=headers)

            print(f"   Status: {response.status_code}")
            
            success = response.status_code == expected_status
            response_data = {}
            
            try:
                response_data = response.json()
                if success:
                    print(f"   Response: {json.dumps(response_data, indent=2)[:200]}...")
                else:
                    print(f"   Error Response: {response_data}")
            except:
                if not success:
                    print(f"   Raw Response: {response.text[:200]}...")

            self.log_test(name, success, f"Expected {expected_status}, got {response.status_code}")
            return success, response_data

        except Exception as e:
            error_msg = f"Request failed: {str(e)}"
            print(f"   ❌ {error_msg}")
            self.log_test(name, False, error_msg)
            return False, {}

    def test_user_registration(self):
        """Test user registration"""
        timestamp = int(time.time())
        test_data = {
            "email": f"testclient_{timestamp}@example.com",
            "password": "TestPass123!",
            "name": f"Test Client {timestamp}",
            "role": "client",
            "phone": "+33123456789",
            "address": "123 Test Street, Paris"
        }
        
        success, response = self.run_test(
            "User Registration (Client)",
            "POST",
            "auth/register",
            200,
            data=test_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            self.user_id = response['user']['id']
            print(f"   ✅ Token received: {self.token[:20]}...")
            return True
        return False

    def test_user_login(self):
        """Test user login with existing credentials"""
        # Try to login with the registered user
        if not hasattr(self, 'test_email'):
            return False
            
        login_data = {
            "email": self.test_email,
            "password": "TestPass123!"
        }
        
        success, response = self.run_test(
            "User Login",
            "POST", 
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.token = response['token']
            return True
        return False

    def test_get_user_profile(self):
        """Test getting user profile"""
        success, response = self.run_test(
            "Get User Profile",
            "GET",
            "auth/me",
            200
        )
        return success

    def test_get_services(self):
        """Test getting services list"""
        success, response = self.run_test(
            "Get Services List",
            "GET",
            "services",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   ✅ Found {len(response)} services")
            if len(response) > 0:
                self.test_service_id = response[0]['id']
                print(f"   ✅ Using service ID: {self.test_service_id}")
            return True
        return False

    def test_create_order(self):
        """Test creating an order with image upload"""
        if not hasattr(self, 'test_service_id'):
            print("   ❌ No service ID available for order creation")
            return False

        # Create a simple test image file
        import io
        from PIL import Image
        
        # Create a simple test image
        img = Image.new('RGB', (100, 100), color='red')
        img_bytes = io.BytesIO()
        img.save(img_bytes, format='JPEG')
        img_bytes.seek(0)

        form_data = {
            'service_id': self.test_service_id,
            'delivery_option': 'standard',
            'notes': 'Test order notes'
        }
        
        files = {
            'images': ('test_shoe.jpg', img_bytes, 'image/jpeg')
        }

        success, response = self.run_test(
            "Create Order with Image",
            "POST",
            "orders",
            200,
            data=form_data,
            files=files
        )
        
        if success and 'order_id' in response:
            self.test_order_id = response['order_id']
            self.reference_number = response['reference_number']
            print(f"   ✅ Order created: {self.test_order_id}")
            print(f"   ✅ Reference: {self.reference_number}")
            return True
        return False

    def test_get_orders(self):
        """Test getting user orders"""
        success, response = self.run_test(
            "Get User Orders",
            "GET",
            "orders",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   ✅ Found {len(response)} orders")
            return True
        return False

    def test_get_order_details(self):
        """Test getting specific order details"""
        if not hasattr(self, 'test_order_id'):
            print("   ❌ No order ID available")
            return False

        success, response = self.run_test(
            "Get Order Details",
            "GET",
            f"orders/{self.test_order_id}",
            200
        )
        return success

    def test_create_payment_intent(self):
        """Test creating Stripe payment intent"""
        if not hasattr(self, 'test_order_id'):
            print("   ❌ No order ID available")
            return False

        success, response = self.run_test(
            "Create Payment Intent",
            "POST",
            f"orders/{self.test_order_id}/payment",
            200
        )
        
        if success and 'client_secret' in response:
            print(f"   ✅ Payment intent created")
            return True
        return False

    def test_confirm_payment(self):
        """Test confirming payment"""
        if not hasattr(self, 'test_order_id'):
            print("   ❌ No order ID available")
            return False

        success, response = self.run_test(
            "Confirm Payment",
            "POST",
            f"orders/{self.test_order_id}/confirm",
            200
        )
        return success

    def test_get_stats(self):
        """Test getting user statistics"""
        success, response = self.run_test(
            "Get User Statistics",
            "GET",
            "stats",
            200
        )
        
        if success:
            print(f"   ✅ Stats: {response}")
            return True
        return False

    def test_cobbler_registration(self):
        """Test cobbler registration"""
        timestamp = int(time.time())
        test_data = {
            "email": f"testcobbler_{timestamp}@example.com",
            "password": "TestPass123!",
            "name": f"Test Cobbler {timestamp}",
            "role": "cobbler",
            "phone": "+33987654321",
            "address": "456 Cobbler Street, Lyon"
        }
        
        success, response = self.run_test(
            "Cobbler Registration",
            "POST",
            "auth/register",
            200,
            data=test_data
        )
        
        if success and 'token' in response:
            self.cobbler_token = response['token']
            self.cobbler_id = response['user']['id']
            print(f"   ✅ Cobbler registered: {self.cobbler_id}")
            return True
        return False

    def test_get_cobblers(self):
        """Test getting cobblers list"""
        success, response = self.run_test(
            "Get Cobblers List",
            "GET",
            "cobblers",
            200
        )
        
        if success and isinstance(response, list):
            print(f"   ✅ Found {len(response)} cobblers")
            return True
        return False

def main():
    print("🧪 Starting ShoeRepair API Tests")
    print("=" * 50)
    
    tester = ShoeRepairAPITester()
    
    # Test sequence
    tests = [
        tester.test_user_registration,
        tester.test_get_user_profile,
        tester.test_get_services,
        tester.test_create_order,
        tester.test_get_orders,
        tester.test_get_order_details,
        tester.test_create_payment_intent,
        tester.test_confirm_payment,
        tester.test_get_stats,
        tester.test_cobbler_registration,
        tester.test_get_cobblers,
    ]
    
    # Run all tests
    for test in tests:
        try:
            test()
        except Exception as e:
            print(f"❌ Test {test.__name__} crashed: {str(e)}")
            tester.log_test(test.__name__, False, f"Test crashed: {str(e)}")
        
        time.sleep(0.5)  # Small delay between tests

    # Print summary
    print("\n" + "=" * 50)
    print("📊 TEST SUMMARY")
    print("=" * 50)
    print(f"Tests run: {tester.tests_run}")
    print(f"Tests passed: {tester.tests_passed}")
    print(f"Tests failed: {tester.tests_run - tester.tests_passed}")
    print(f"Success rate: {(tester.tests_passed/tester.tests_run*100):.1f}%")
    
    # Print failed tests
    failed_tests = [t for t in tester.test_results if not t['success']]
    if failed_tests:
        print("\n❌ FAILED TESTS:")
        for test in failed_tests:
            print(f"  - {test['test']}: {test['details']}")
    
    return 0 if tester.tests_passed == tester.tests_run else 1

if __name__ == "__main__":
    sys.exit(main())