import requests
import sys
import json
import time
import base64
from datetime import datetime

class ShoeRepairAPITester:
    def __init__(self, base_url="https://cordonnerie-1.preview.emergentagent.com"):
        self.base_url = base_url
        self.api_url = f"{base_url}/api"
        self.token = None
        self.user_id = None
        self.admin_token = None
        self.cobbler_token = None
        self.cobbler_id = None
        self.partner_id = None
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
            elif method == 'PUT':
                response = requests.put(url, json=data, headers=headers)

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

    def create_fake_base64_image(self):
        """Create a fake base64 encoded image for testing"""
        # Create a simple 1x1 pixel image in base64
        return "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg=="

    def create_fake_base64_pdf(self):
        """Create a fake base64 encoded PDF for testing"""
        # Simple PDF header in base64
        return "JVBERi0xLjQKJcOkw7zDtsO4CjIgMCBvYmoKPDwKL1R5cGUgL0NhdGFsb2cKL1BhZ2VzIDMgMCBSCj4+CmVuZG9iagoKMyAwIG9iago8PAovVHlwZSAvUGFnZXMKL0tpZHMgWzQgMCBSXQovQ291bnQgMQo+PgplbmRvYmoKCjQgMCBvYmoKPDwKL1R5cGUgL1BhZ2UKL1BhcmVudCAzIDAgUgovTWVkaWFCb3ggWzAgMCA2MTIgNzkyXQo+PgplbmRvYmoKCnhyZWYKMCA1CjAwMDAwMDAwMDAgNjU1MzUgZiAKMDAwMDAwMDAwOSAwMDAwMCBuIAowMDAwMDAwMDc0IDAwMDAwIG4gCjAwMDAwMDAxMjAgMDAwMDAgbiAKMDAwMDAwMDE3OSAwMDAwMCBuIAp0cmFpbGVyCjw8Ci9TaXplIDUKL1Jvb3QgMiAwIFIKPj4Kc3RhcnR4cmVmCjI2NQolJUVPRg=="

    def test_admin_login(self):
        """Test admin login"""
        login_data = {
            "email": "admin@shoerepair.com",
            "password": "Arden2018@"
        }
        
        success, response = self.run_test(
            "Admin Login",
            "POST",
            "auth/login",
            200,
            data=login_data
        )
        
        if success and 'token' in response:
            self.admin_token = response['token']
            print(f"   ✅ Admin token received: {self.admin_token[:20]}...")
            return True
        return False

    def test_partner_registration_with_documents(self):
        """Test partner registration with document upload - P1 Feature"""
        timestamp = int(time.time())
        
        # Create fake documents
        id_recto_b64 = self.create_fake_base64_image()
        id_verso_b64 = self.create_fake_base64_image()
        che_kbis_b64 = self.create_fake_base64_pdf()
        
        # Use the exact test data from the French review request
        test_data = {
            "email": f"cobbler_new_{timestamp}@test.com",  # Make unique
            "password": "TestPass123",
            "name": "Pierre Cordonnier",
            "role": "cobbler",
            "phone": "+41791234567",
            "address": "Rue de Genève 15, 1003 Lausanne, Suisse",
            "bank_account": "CH93 0000 0000 0000 0000 1",
            "id_recto": f"data:image/png;base64,{id_recto_b64}",
            "id_verso": f"data:image/png;base64,{id_verso_b64}",
            "che_kbis": f"data:application/pdf;base64,{che_kbis_b64}"
        }
        
        success, response = self.run_test(
            "Partner Registration with Documents",
            "POST",
            "auth/register",
            200,
            data=test_data
        )
        
        if success and 'token' in response and response.get('user', {}).get('role') == 'cobbler':
            self.cobbler_token = response['token']
            self.partner_id = response['user']['id']
            print(f"   ✅ Partner registered: {self.partner_id}")
            print(f"   ✅ Partner role: {response.get('user', {}).get('role')}")
            print(f"   ✅ Token received - status should be 'pending'")
            return True
        return False

    def test_check_uploads_directory(self):
        """Test that files were created in uploads directory"""
        import os
        uploads_dir = "/app/backend/uploads"
        
        if os.path.exists(uploads_dir):
            files = os.listdir(uploads_dir)
            print(f"   ✅ Uploads directory exists with {len(files)} files")
            if len(files) >= 3:  # Should have at least 3 files (id_recto, id_verso, che_kbis)
                print(f"   ✅ Expected document files found: {files}")
                self.log_test("Check Uploads Directory", True, f"Found {len(files)} files")
                return True
            else:
                self.log_test("Check Uploads Directory", False, f"Expected 3+ files, found {len(files)}")
                return False
        else:
            self.log_test("Check Uploads Directory", False, "Uploads directory does not exist")
            return False

    def test_admin_get_pending_partners(self):
        """Test admin getting pending partner requests"""
        if not self.admin_token:
            print("   ❌ No admin token available")
            return False
            
        # Set admin token temporarily
        original_token = self.token
        self.token = self.admin_token
        
        success, response = self.run_test(
            "Admin Get Pending Partners",
            "GET",
            "admin/partners/pending",
            200
        )
        
        # Restore original token
        self.token = original_token
        
        if success and isinstance(response, list):
            print(f"   ✅ Found {len(response)} pending partners")
            # Check if our partner is in the list
            partner_found = False
            for partner in response:
                if partner.get('id') == self.partner_id:
                    partner_found = True
                    print(f"   ✅ Partner found in pending list")
                    # Check for preview keys
                    if 'id_recto_preview' in partner and 'id_verso_preview' in partner and 'che_kbis_preview' in partner:
                        print(f"   ✅ Document previews available")
                    else:
                        print(f"   ⚠️ Some document previews missing")
                    break
            
            if not partner_found and self.partner_id:
                print(f"   ⚠️ Registered partner not found in pending list")
            
            return True
        return False

    def test_admin_approve_partner(self):
        """Test admin approving a partner"""
        if not self.admin_token or not self.partner_id:
            print("   ❌ No admin token or partner ID available")
            return False
            
        # Set admin token temporarily
        original_token = self.token
        self.token = self.admin_token
        
        success, response = self.run_test(
            "Admin Approve Partner",
            "POST",
            f"admin/partners/{self.partner_id}/approve",
            200
        )
        
        # Restore original token
        self.token = original_token
        
        if success:
            print(f"   ✅ Partner approved successfully")
            return True
        return False

    def test_verify_partner_approved(self):
        """Test that partner is no longer in pending list after approval"""
        if not self.admin_token:
            print("   ❌ No admin token available")
            return False
            
        # Set admin token temporarily
        original_token = self.token
        self.token = self.admin_token
        
        success, response = self.run_test(
            "Verify Partner Not in Pending List",
            "GET",
            "admin/partners/pending",
            200
        )
        
        # Restore original token
        self.token = original_token
        
        if success and isinstance(response, list):
            # Check that our partner is NOT in the pending list anymore
            partner_found = False
            for partner in response:
                if partner.get('id') == self.partner_id:
                    partner_found = True
                    break
            
            if not partner_found:
                print(f"   ✅ Partner no longer in pending list (approved)")
                self.log_test("Verify Partner Not in Pending List", True, "Partner successfully removed from pending")
                return True
            else:
                self.log_test("Verify Partner Not in Pending List", False, "Partner still in pending list")
                return False
        return False

    def test_cobbler_update_address(self):
        """Test cobbler updating their address - P2 Feature"""
        if not self.cobbler_token:
            print("   ❌ No cobbler token available")
            return False
            
        # Set cobbler token temporarily
        original_token = self.token
        self.token = self.cobbler_token
        
        # Use the exact address from the French review request
        address_data = {
            "address": "Place de la Gare 10, 1003 Lausanne, Suisse"
        }
        
        success, response = self.run_test(
            "Cobbler Update Address",
            "PUT",
            "cobbler/address",
            200,
            data=address_data
        )
        
        # Restore original token
        self.token = original_token
        
        if success and 'latitude' in response and 'longitude' in response:
            lat = response['latitude']
            lon = response['longitude']
            print(f"   ✅ Address updated with coordinates: lat={lat}, lon={lon}")
            
            # Validate coordinates are reasonable
            if -90 <= lat <= 90 and -180 <= lon <= 180:
                print(f"   ✅ Coordinates are valid")
                return True
            else:
                print(f"   ❌ Invalid coordinates: lat={lat}, lon={lon}")
                return False
        return False

    def test_unauthorized_access(self):
        """Test unauthorized access to admin endpoints"""
        # Try to access admin endpoint without admin token
        original_token = self.token
        self.token = self.cobbler_token  # Use cobbler token instead of admin
        
        success, response = self.run_test(
            "Unauthorized Access to Admin Endpoint",
            "GET",
            "admin/partners/pending",
            403  # Expect 403 Forbidden
        )
        
        # Restore original token
        self.token = original_token
        
        return success

    def test_invalid_address_geocoding(self):
        """Test address update with invalid address"""
        if not self.cobbler_token:
            print("   ❌ No cobbler token available")
            return False
            
        # Set cobbler token temporarily
        original_token = self.token
        self.token = self.cobbler_token
        
        invalid_address_data = {
            "address": "XXXXX"
        }
        
        success, response = self.run_test(
            "Invalid Address Geocoding",
            "PUT",
            "cobbler/address",
            400  # Expect 400 Bad Request
        )
        
        # Restore original token
        self.token = original_token
        
        return success

    def test_partner_rejection(self):
        """Test admin rejecting a partner"""
        # First create another partner to reject
        timestamp = int(time.time())
        
        id_recto_b64 = self.create_fake_base64_image()
        id_verso_b64 = self.create_fake_base64_image()
        che_kbis_b64 = self.create_fake_base64_pdf()
        
        test_data = {
            "email": f"reject_cobbler_{timestamp}@test.com",
            "password": "TestPass123",
            "name": f"Reject Cobbler {timestamp}",
            "role": "cobbler",
            "phone": "+41791234568",
            "address": "Test Street 1, 1000 Lausanne, Suisse",
            "bank_account": "CH93 0000 0000 0000 0001 0",
            "id_recto": f"data:image/png;base64,{id_recto_b64}",
            "id_verso": f"data:image/png;base64,{id_verso_b64}",
            "che_kbis": f"data:application/pdf;base64,{che_kbis_b64}"
        }
        
        success, response = self.run_test(
            "Create Partner for Rejection Test",
            "POST",
            "auth/register",
            200,
            data=test_data
        )
        
        if not success:
            return False
            
        reject_partner_id = response['user']['id']
        
        # Now reject this partner as admin
        if not self.admin_token:
            print("   ❌ No admin token available")
            return False
            
        # Set admin token temporarily
        original_token = self.token
        self.token = self.admin_token
        
        success, response = self.run_test(
            "Admin Reject Partner",
            "POST",
            f"admin/partners/{reject_partner_id}/reject?reason=Documents non conformes",
            200
        )
        
        # Restore original token
        self.token = original_token
        
        if success:
            print(f"   ✅ Partner rejected successfully")
            return True
        return False

    def test_cobbler_registration(self):
        """Test basic cobbler registration (legacy test)"""
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
            "Basic Cobbler Registration",
            "POST",
            "auth/register",
            200,
            data=test_data
        )
        
        if success and 'token' in response:
            print(f"   ✅ Basic cobbler registered")
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
    print("🧪 Starting ShoeRepair Partner Registration Tests")
    print("=" * 60)
    
    tester = ShoeRepairAPITester()
    
    # Test sequence for partner registration features
    tests = [
        # Admin login first
        tester.test_admin_login,
        
        # Test 1: Partner registration with documents
        tester.test_partner_registration_with_documents,
        tester.test_check_uploads_directory,
        
        # Test 2: Admin - List pending partners
        tester.test_admin_get_pending_partners,
        
        # Test 3: Admin - Approve partner
        tester.test_admin_approve_partner,
        tester.test_verify_partner_approved,
        
        # Test 4: Cobbler - Update address
        tester.test_cobbler_update_address,
        
        # Test 5: Error handling and validations
        tester.test_unauthorized_access,
        tester.test_invalid_address_geocoding,
        tester.test_partner_rejection,
        
        # Legacy tests (optional)
        tester.test_user_registration,
        tester.test_get_user_profile,
        tester.test_get_services,
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