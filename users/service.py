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
        
    @staticmethod
    def get_dungeon_by_user(user):
        try:
            return user.userprofile.in_current_dungeon
        except Exception:
            return None
    
    @staticmethod
    def get_dungeon_cards_for_user(user):
        dungeon = UserService.get_dungeon_by_user(user)
        if dungeon:
            return dungeon.dungeon_cards.all()
        return []