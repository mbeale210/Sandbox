from flask import Flask, jsonify, request
from flask_sqlalchemy import SQLAlchemy
from flask_migrate import Migrate
from flask_jwt_extended import JWTManager, create_access_token, create_refresh_token, jwt_required, get_jwt_identity
from flask_cors import CORS
from config import Config
from werkzeug.security import generate_password_hash, check_password_hash
from flask_bcrypt import Bcrypt  # Import Bcrypt

# Initialize extensions
db = SQLAlchemy()
migrate = Migrate()
jwt = JWTManager()
bcrypt = Bcrypt()  # Initialize Bcrypt here

def create_app(config_class=Config):
    app = Flask(__name__)
    app.config.from_object(config_class)

    # Initialize extensions
    CORS(app, resources={r"/*": {"origins": "http://localhost:3000"}}, supports_credentials=True)
    db.init_app(app)
    migrate.init_app(app, db)
    jwt.init_app(app)
    bcrypt.init_app(app)  # Initialize bcrypt with app

    # Import routes and models after extensions are initialized
    from app.models import User, League, FantasyTeam, Rider, Stage, StageResult

    # Auth Routes
    @app.route('/auth/register', methods=['POST'])
    def register():
        data = request.get_json()
        if User.query.filter_by(username=data['username']).first():
            return jsonify({"message": "Username already exists"}), 400
        if User.query.filter_by(email=data['email']).first():
            return jsonify({"message": "Email already exists"}), 400

        user = User(username=data['username'], email=data['email'])
        user.set_password(data['password'])
        db.session.add(user)
        db.session.commit()
        return jsonify({'message': 'Registered successfully'}), 201

    @app.route('/auth/login', methods=['POST'])
    def login():
        data = request.get_json()
        user = User.query.filter_by(username=data['username']).first()
        if user and user.check_password(data['password']):
            access_token = create_access_token(identity=user.id)
            refresh_token = create_refresh_token(identity=user.id)
            return jsonify({
                'access_token': access_token,
                'refresh_token': refresh_token,
                'user': {
                    'id': user.id,
                    'username': user.username,
                    'email': user.email
                }
            }), 200
        return jsonify({'message': 'Invalid username or password'}), 401

    @app.route('/auth/refresh', methods=['POST'])
    @jwt_required(refresh=True)
    def refresh():
        current_user = get_jwt_identity()
        new_access_token = create_access_token(identity=current_user)
        return jsonify({'access_token': new_access_token}), 200

    @app.route('/auth/user', methods=['GET'])
    @jwt_required()
    def get_user():
        current_user_id = get_jwt_identity()
        user = User.query.get(current_user_id)
        return jsonify({
            'id': user.id,
            'username': user.username,
            'email': user.email
        }), 200

    # Rider Rankings Route - Public access (no login required)
    @app.route('/riders/rankings', methods=['GET', 'OPTIONS'])
    def get_rider_rankings():
        if request.method == 'OPTIONS':
            return jsonify({'message': 'CORS preflight successful'}), 200  # Handle preflight

        riders = Rider.query.order_by(Rider.rank).all()
        return jsonify([{
            "id": rider.id,
            "name": rider.name,
            "rank": rider.rank,
            "career_points": rider.career_points,
            "sprint_pts": rider.sprint_pts,
            "mountain_pts": rider.mountain_pts,
            "is_gc": rider.is_gc
        } for rider in riders]), 200

    # Teams Route
    @app.route('/teams', methods=['GET', 'POST', 'OPTIONS'])
    @jwt_required()
    def handle_teams():
        if request.method == 'OPTIONS':
            return jsonify({'message': 'CORS preflight successful'}), 200  # Handle preflight

        user_id = get_jwt_identity()
        if request.method == 'POST':
            data = request.get_json()
            new_team = FantasyTeam(name=data['name'], user_id=user_id, league_id=data.get('league_id'))
            db.session.add(new_team)
            db.session.commit()
            return jsonify({"message": "Team created successfully", "id": new_team.id}), 201
        elif request.method == 'GET':
            teams = FantasyTeam.query.filter_by(user_id=user_id).all()
            return jsonify([{
                "id": team.id,
                "name": team.name,
                "sprint_pts": team.sprint_pts,
                "mountain_pts": team.mountain_pts,
                "trades_left": team.trades_left,
                "riders": [{
                    "id": rider.id,
                    "name": rider.name
                } for rider in team.riders]
            } for team in teams]), 200

    # Stages Route
    @app.route('/stages', methods=['GET', 'OPTIONS'])
    def get_stages():
        if request.method == 'OPTIONS':
            return jsonify({'message': 'CORS preflight successful'}), 200  # Handle preflight

        stages = Stage.query.all()
        return jsonify([{
            "id": stage.id,
            "number": stage.number,
            "date": stage.date.isoformat(),
            "type": stage.type,
            "is_rest_day": stage.is_rest_day
        } for stage in stages]), 200

    return app
