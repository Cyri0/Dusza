from django.contrib.auth import get_user_model

class UserService:
    @staticmethod
    def get_user_by_id(user_id):
        User = get_user_model()
        try:
            return User.objects.get(id=user_id)
        except User.DoesNotExist:
            return None
        
    @staticmethod
    def get_role_by_id(user_id):
        User = get_user_model()
        try:
            user = User.objects.get(id=user_id)
            print(type(user.userprofile.role))
            return user.userprofile.role
        except User.DoesNotExist:
            return None